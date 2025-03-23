import { useState } from 'react';
import { FormData } from '@/types';

type ValidationErrors = Record<string, string>;

interface UseFormValidationProps {
  initialData: FormData;
}

/**
 * 表单验证自定义Hook
 * - 提供集中的表单验证逻辑
 * - 提供表单错误状态管理
 * - 提供表单提交验证
 */
export function useFormValidation({ initialData }: UseFormValidationProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * 更新表单数据
   * @param field 表单字段名
   * @param value 新的字段值
   */
  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // 清除该字段的错误
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  /**
   * 批量更新表单数据
   * @param newData 部分表单数据
   */
  const updateFormDataBatch = (newData: Partial<FormData>) => {
    setFormData(prev => ({
      ...prev,
      ...newData,
    }));

    // 清除更新字段的错误
    const fieldsToUpdate = Object.keys(newData) as Array<keyof FormData>;
    const errorsToUpdate: ValidationErrors = {};
    let hasErrorsToUpdate = false;

    fieldsToUpdate.forEach(field => {
      if (errors[field]) {
        errorsToUpdate[field] = '';
        hasErrorsToUpdate = true;
      }
    });

    if (hasErrorsToUpdate) {
      setErrors(prev => ({
        ...prev,
        ...errorsToUpdate,
      }));
    }
  };

  /**
   * 验证表单是否有效
   * @param selectedConfigs 已选择的配置类型
   * @param activeTab 活动标签页
   * @param selectedMode 选择的模式
   * @returns 是否有效
   */
  const validateForm = (
    selectedConfigs: string[],
    activeTab: string,
    selectedMode: string,
  ): boolean => {
    const newErrors: ValidationErrors = {};
    
    // 验证是否选择了指定的数据制作原因
    const validReasons = ["下发失败", "华为ONU", "加装IPTV"];
    if (!selectedMode || !validReasons.includes(selectedMode)) {
      newErrors.selectedMode = '请选择数据制作原因（下发失败、华为ONU或加装IPTV）';
    }

    // 华为组播配置特殊处理
    if (activeTab === "huawei-multicast") {
      if (!formData.multicastVlan) {
        newErrors.multicastVlan = '请输入组播VLAN';
      }
    } else {
      // 基本字段验证（除华为组播配置外的所有配置都需要）
      if (!formData.serial) {
        newErrors.serial = '请输入序列号';
      }
      if (!formData.slot) {
        newErrors.slot = '请输入槽位号';
      }
      if (!formData.ponPort) {
        newErrors.ponPort = '请输入PON口';
      }
      if (!formData.deviceNum) {
        newErrors.deviceNum = '请输入设备号';
      }
    }

    // 根据不同配置类型进行特定验证
    if (selectedConfigs.includes("huawei")) {
      switch (activeTab) {
        case "huawei-deploy":
        case "huawei-manual":
          if (!formData.bizVlan) {
            newErrors.bizVlan = '请输入业务VLAN';
          }
          if (!formData.iptvVlan) {
            newErrors.iptvVlan = '请输入IPTV VLAN';
          }
          break;

        case "huawei-onu":
          if (!formData.ipaddr) {
            newErrors.ipaddr = '请输入IP地址';
          } else if (!formData.ipaddr.startsWith("192.168.77.") && !formData.ipaddr.startsWith("10.155.")) {
            newErrors.ipaddr = '请输入正确格式的IP地址（192.168.77.x 或 10.155.x.x）';
          }
          
          if (selectedConfigs.includes("voice")) {
            if (!formData.voiceipaddr) {
              newErrors.voiceipaddr = '请输入语音IP地址';
            } else if (!formData.voiceipaddr.startsWith("10.251.") && !formData.voiceipaddr.startsWith("10.66.")) {
              newErrors.voiceipaddr = '请输入正确格式的语音IP地址（10.251.x.x 或 10.66.x.x）';
            }
          }
          break;
      }
    }

    if (selectedConfigs.includes("zte")) {
      switch (activeTab) {
        case "zte-c300":
        case "zte-c600-manual":
        case "zte-c600-deploy":
          if (!formData.bizVlan) {
            newErrors.bizVlan = '请输入业务VLAN';
          }
          if (!formData.iptvVlan) {
            newErrors.iptvVlan = '请输入IPTV VLAN';
          }
          break;
      }
    }

    // 序列号格式验证
    if (activeTab === "huawei-deploy" || activeTab === "zte-c600-deploy") {
      // 验证0734开头的12位纯数字，或0734开头的12位纯数字+@swzx
      const serialPattern = /^0734\d{8}(@swzx)?$/;
      if (!serialPattern.test(formData.serial)) {
        newErrors.serial = '请输入正确的账号';
      }
    } else if (activeTab === "huawei-manual" || activeTab === "zte-c300" || activeTab === "zte-c600-manual") {
      // 验证序列号是否为字母和数字的组合，不再验证长度
      const alphanumericPattern = /^[A-Za-z0-9]+$/;
      if (!alphanumericPattern.test(formData.serial)) {
        newErrors.serial = '请输入正确的序列号（字母和数字的组合）';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 重置表单数据和错误
   */
  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateFormData,
    updateFormDataBatch,
    validateForm,
    resetForm,
  };
} 