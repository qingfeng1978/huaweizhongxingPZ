import { useState, useCallback } from 'react';
import { copyToClipboard, handleError } from '@/lib/utils';
import { DeviceConfig } from '@/types';

/**
 * 应用工具Hook
 * 包含应用中常用的功能：
 * - 复制到剪贴板
 * - 导出数据
 * - 格式化设备信息
 */
export function useAppUtils() {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  /**
   * 复制文本到剪贴板并显示临时提示
   * @param text 要复制的文本
   * @returns Promise<boolean> 是否复制成功
   */
  const copyTextWithFeedback = useCallback(async (
    text: string,
    onSuccess?: (originalText: string) => void,
    onError?: () => void
  ) => {
    if (!text) return false;
    
    try {
      setCopyStatus('idle');
      const success = await copyToClipboard(text);
      
      if (success) {
        setCopyStatus('success');
        if (onSuccess) onSuccess(text);
        setTimeout(() => setCopyStatus('idle'), 1500);
        return true;
      } else {
        setCopyStatus('error');
        if (onError) onError();
        setTimeout(() => setCopyStatus('idle'), 1500);
        return false;
      }
    } catch (error) {
      setCopyStatus('error');
      if (onError) onError();
      setTimeout(() => setCopyStatus('idle'), 1500);
      return false;
    }
  }, []);

  /**
   * 导出配置数据为CSV文件
   * @param configs 配置数据
   * @returns Promise<boolean> 是否导出成功
   */
  const exportConfigsToCSV = useCallback(async (configs: DeviceConfig[]): Promise<boolean> => {
    if (configs.length === 0) {
      alert('暂无数据可导出');
      return false;
    }
    
    try {
      // 格式化数据为CSV格式
      let csvContent = "设备类型,序列号,框号,槽位,PON口,设备号,业务VLAN,IPTV VLAN,IP地址,语音IP地址,组播VLAN,语音开启,创建时间,原因\n";
      
      configs.forEach(config => {
        const deviceType = config.device_type === 'huawei' ? '华为OLT' : '中兴OLT';
        const date = new Date(config.created_at || '').toISOString().split('T')[0];
        
        csvContent += `${deviceType},${config.serial},${config.frame_no || '0'},${config.slot},${config.pon_port},${config.device_num},${config.biz_vlan},${config.iptv_vlan},${config.ip_addr || ''},${config.voice_ip_addr || ''},${config.multicast_vlan || ''},${config.has_voice ? '是' : '否'},${date},${config.reason || ''}\n`;
      });
      
      // 创建Blob对象
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const link = document.createElement("a");
      const fileName = `配置数据_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      await handleError('导出数据失败', error);
      return false;
    }
  }, []);

  /**
   * 获取设备类型显示文本
   * @param type 设备类型
   * @returns 显示文本
   */
  const getDeviceTypeText = useCallback((type?: string): string => {
    if (type === 'huawei') return '华为OLT';
    if (type === 'zte') return '中兴OLT';
    return type || '-';
  }, []);

  /**
   * 获取位置显示格式
   * @param config 配置数据
   * @returns 格式化的位置字符串
   */
  const formatPosition = useCallback((config: DeviceConfig): string => {
    return `${config.frame_no || '0'}/${config.slot}/${config.pon_port}`;
  }, []);

  return {
    copyStatus,
    copyTextWithFeedback,
    exportConfigsToCSV,
    getDeviceTypeText,
    formatPosition
  };
} 