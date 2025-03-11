import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 错误处理工具函数
 */

/**
 * 格式化并记录错误信息
 * @param message 错误消息前缀
 * @param error 错误对象
 */
export function logError(message: string, error: any): void {
  // 提取错误消息
  const errorMessage = error instanceof Error 
    ? error.message 
    : (typeof error === 'string' ? error : JSON.stringify(error));
  
  // 提取堆栈信息
  const errorStack = error instanceof Error ? error.stack : '';
  
  // 记录到控制台
  console.error(`${message}: ${errorMessage}`);
  if (errorStack) {
    console.debug(errorStack);
  }
}

/**
 * 显示用户友好的错误消息
 * @param message 用户友好的错误消息
 * @param error 原始错误对象
 * @returns Promise<void>
 */
export async function handleError(message: string, error: any): Promise<void> {
  // 记录错误
  logError(message, error);
  
  // 显示用户友好的消息
  alert(message);
}

/**
 * 格式化日期为YYYY-MM-DD
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // 只返回日期部分
  } catch (error) {
    logError('日期格式化错误', error);
    return '-';
  }
}

/**
 * 安全地复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    logError('复制到剪贴板失败', error);
    return false;
  }
}
