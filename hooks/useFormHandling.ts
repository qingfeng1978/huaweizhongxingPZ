import { useState, useCallback, useEffect } from 'react';
import { FormData } from '@/types';
import { storage } from '@/lib/storage';
import { validateForm as validateFormUtil, isValidIpAddress, isNumeric, isValidVlan } from '@/lib/validation';

// 默认表单数据
const defaultFormData: FormData = {
  serial: '',
  slot: '',
  ponPort: '',
  deviceNum: '',
  bizVlan: '',
  iptvVlan: '',
  multicastVlan: '',
  ipaddr: '',
  voiceipaddr: '',
  isVoiceEnabled: false
};

interface UseFormHandlingOptions {
  persistKey?: string;
  autoSave?: boolean;
  validateFields?: (keyof FormData)[];
}

/**
 * 表单处理自定义Hook
 * @param options 配置选项
 * @returns 表单状态和处理方法
 */
export default function useFormHandling(options: UseFormHandlingOptions = {}) {
  const {
    persistKey = 'formData',
    autoSave = true,
    validateFields = []
  } = options;

  // 从localStorage加载表单数据
  const getSavedFormData = useCallback((): FormData => {
    const savedData = storage.get(persistKey, defaultFormData);
    return { ...defaultFormData, ...savedData };
  }, [persistKey]);

  const [formData, setFormData] = useState<FormData>(getSavedFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // 更新表单字段
  const updateField = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 自动保存更新后的表单数据
      if (autoSave) {
        storage.set(persistKey, newData);
      }
      
      // 清除相关字段的错误
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      
      return newData;
    });
    
    setIsDirty(true);
  }, [persistKey, autoSave, errors]);
  
  // 执行表单验证
  const validateForm = useCallback(() => {
    const result = validateFormUtil(formData, validateFields);
    setErrors(result.errors);
    return result.isValid;
  }, [formData, validateFields]);
  
  // 重置表单数据
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
    setIsDirty(false);
    
    if (autoSave) {
      storage.set(persistKey, defaultFormData);
    }
  }, [persistKey, autoSave]);
  
  // 保存表单数据
  const saveForm = useCallback(() => {
    storage.set(persistKey, formData);
    setIsDirty(false);
  }, [persistKey, formData]);
  
  // 批量更新表单数据
  const updateFormData = useCallback((newData: Partial<FormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      
      if (autoSave) {
        storage.set(persistKey, updated);
      }
      
      return updated;
    });
    
    setIsDirty(true);
  }, [persistKey, autoSave]);

  // 监听window的beforeunload事件，如果表单有未保存的更改则提示用户
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    saveForm,
    updateFormData
  };
} 