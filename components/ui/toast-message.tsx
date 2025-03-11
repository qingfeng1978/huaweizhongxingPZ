"use client"

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessageProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  className?: string;
  visible?: boolean;
}

/**
 * Toast消息组件
 * 用于显示操作成功或失败的消息提示
 */
export function ToastMessage({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  className,
  visible = true,
}: ToastMessageProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const iconMap = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
  };

  const bgColorMap = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between p-4 rounded-md border shadow-md animate-in fade-in slide-in-from-top-5 min-w-[300px] max-w-[90%]',
        bgColorMap[type],
        className
      )}
    >
      <div className="flex items-center">
        <span className="mr-2 flex-shrink-0">{iconMap[type]}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button onClick={handleClose} className="ml-4 hover:opacity-70 flex-shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Toast容器组件上下文
 */
type ToastContextType = {
  showToast: (props: Omit<ToastMessageProps, 'visible' | 'onClose'>) => void;
  hideToast: () => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

/**
 * Toast容器组件
 * 用于管理多个Toast消息
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessageProps | null>(null);

  const showToast = (props: Omit<ToastMessageProps, 'visible' | 'onClose'>) => {
    setToast({ ...props, visible: true, onClose: () => setToast(null) });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && <ToastMessage {...toast} />}
    </ToastContext.Provider>
  );
}

/**
 * Toast钩子
 * 用于在组件中显示Toast消息
 */
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 