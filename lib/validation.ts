/**
 * 表单验证工具
 */
import { FormData } from '@/types';

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

/**
 * 验证IP地址格式
 * @param ip IP地址字符串
 * @returns 是否为有效IP地址
 */
export function isValidIpAddress(ip: string): boolean {
  if (!ip || ip.trim() === '') return true; // 空值视为有效，由必填验证处理
  
  const pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return pattern.test(ip);
}

/**
 * 验证是否为数字字符串
 * @param value 要验证的值
 * @returns 是否为有效数字
 */
export function isNumeric(value: string): boolean {
  if (!value || value.trim() === '') return true; // 空值视为有效，由必填验证处理
  
  return /^\d+$/.test(value);
}

/**
 * 验证VLAN范围 (1-4094)
 * @param vlan VLAN值
 * @returns 是否为有效VLAN
 */
export function isValidVlan(vlan: string): boolean {
  if (!vlan || vlan.trim() === '') return true; // 空值视为有效，由必填验证处理
  
  if (!isNumeric(vlan)) return false;
  
  const vlanNum = parseInt(vlan, 10);
  return vlanNum >= 1 && vlanNum <= 4094;
}

/**
 * 验证表单数据
 * @param formData 表单数据
 * @param requiredFields 必填字段列表
 * @returns 验证结果
 */
export function validateForm(formData: FormData, requiredFields: (keyof FormData)[] = []): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: {}
  };
  
  // 验证必填字段
  for (const field of requiredFields) {
    const value = formData[field];
    if (typeof value === 'string' && (!value || value.trim() === '')) {
      result.errors[field] = `${field}不能为空`;
      result.isValid = false;
    }
  }
  
  // 验证IP地址
  if (formData.ipaddr && !isValidIpAddress(formData.ipaddr)) {
    result.errors.ipaddr = 'IP地址格式无效';
    result.isValid = false;
  }
  
  if (formData.voiceipaddr && !isValidIpAddress(formData.voiceipaddr)) {
    result.errors.voiceipaddr = '语音IP地址格式无效';
    result.isValid = false;
  }
  
  // 验证VLAN
  if (formData.bizVlan && !isValidVlan(formData.bizVlan)) {
    result.errors.bizVlan = '业务VLAN必须是1-4094之间的数字';
    result.isValid = false;
  }
  
  if (formData.iptvVlan && !isValidVlan(formData.iptvVlan)) {
    result.errors.iptvVlan = 'IPTV VLAN必须是1-4094之间的数字';
    result.isValid = false;
  }
  
  if (formData.multicastVlan && !isValidVlan(formData.multicastVlan)) {
    result.errors.multicastVlan = '组播VLAN必须是1-4094之间的数字';
    result.isValid = false;
  }
  
  // 验证序列号、槽位、端口等是否为数字
  if (formData.slot && !isNumeric(formData.slot)) {
    result.errors.slot = '槽位必须是数字';
    result.isValid = false;
  }
  
  if (formData.ponPort && !isNumeric(formData.ponPort)) {
    result.errors.ponPort = 'PON口必须是数字';
    result.isValid = false;
  }
  
  if (formData.deviceNum && !isNumeric(formData.deviceNum)) {
    result.errors.deviceNum = '设备序号必须是数字';
    result.isValid = false;
  }
  
  return result;
}

/**
 * 获取表单验证错误信息
 * @param validationResult 验证结果
 * @returns 错误消息
 */
export function getValidationErrorMessage(validationResult: ValidationResult): string {
  if (validationResult.isValid) {
    return '';
  }
  
  return Object.values(validationResult.errors)[0] || '表单验证失败';
} 