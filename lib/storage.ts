/**
 * 安全的localStorage封装
 * - 处理服务端渲染场景
 * - 提供错误处理
 * - 支持JSON序列化/反序列化
 */

export const storage = {
  /**
   * 从localStorage获取数据
   * @param key 存储键名
   * @param defaultValue 默认值，如果无法获取数据则返回此值
   * @returns 获取的数据或默认值
   */
  get: (key: string, defaultValue: any = null) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const value = localStorage.getItem(key);
      if (!value) return defaultValue;
      
      // 尝试解析JSON，如果失败则返回原始字符串
      try {
        return JSON.parse(value);
      } catch {
        // 如果无法解析为JSON，则返回原始字符串值
        return value;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  /**
   * 将数据存储到localStorage
   * @param key 存储键名
   * @param value 要存储的数据
   */
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      // 如果值已经是字符串且不是对象字符串表示，则直接存储
      const valueToStore = 
        typeof value === 'string' && !value.startsWith('{') && !value.startsWith('[') 
          ? value 
          : JSON.stringify(value);
      
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  /**
   * 从localStorage移除数据
   * @param key 要移除的键名
   */
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  /**
   * 检查浏览器是否支持localStorage
   * @returns 是否支持localStorage
   */
  isSupported: () => {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}; 