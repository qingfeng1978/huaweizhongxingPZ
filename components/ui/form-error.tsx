import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * 表单错误消息组件
 * 用于在表单字段下方显示错误信息
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center text-sm text-red-500 mt-1",
        className
      )}
    >
      <AlertCircle className="h-3.5 w-3.5 mr-1" />
      <span>{message}</span>
    </div>
  );
}

/**
 * 表单提示消息组件
 * 用于在表单字段下方显示帮助信息
 */
export function FormDescription({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}

/**
 * 表单标签组件
 * 用于表单字段的标签
 */
export function FormLabel({ 
  children,
  required,
  className 
}: { 
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("text-sm font-medium mb-1.5", className)}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </div>
  );
} 