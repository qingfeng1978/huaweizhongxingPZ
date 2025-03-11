import { useState, useEffect, useRef } from 'react';

/**
 * 防抖Hook，延迟处理状态变更
 * @param value 需要防抖的值
 * @param delay 延迟时间(毫秒)
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // 设置定时器在指定延迟后更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // 清理函数，在下一次effect执行前或组件卸载时执行
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * 防抖回调Hook，防止函数频繁触发
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(毫秒)
 * @returns 防抖处理后的函数
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay = 500
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  return (...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * 防抖期间显示加载状态
 * @param value 需要防抖的值
 * @param delay 延迟时间(毫秒)
 * @returns [防抖后的值, 加载状态]
 */
export function useDebouncedLoading<T>(value: T, delay = 500): [T, boolean] {
  const [isLoading, setIsLoading] = useState(false);
  const debouncedValue = useDebounce(value, delay);
  
  useEffect(() => {
    if (value !== debouncedValue) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [value, debouncedValue]);
  
  return [debouncedValue, isLoading];
} 