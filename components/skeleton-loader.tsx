import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string | number;
  width?: string | number;
  circle?: boolean;
  inline?: boolean;
}

/**
 * 骨架屏加载组件
 */
export const Skeleton = memo(function Skeleton({
  className,
  count = 1,
  height,
  width,
  circle = false,
  inline = false,
}: SkeletonProps) {
  const style = {
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    borderRadius: circle ? '50%' : undefined,
    display: inline ? 'inline-block' : undefined,
  };

  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse bg-gray-200 dark:bg-gray-700',
              { 'mb-2': !inline && i !== count - 1 },
              { 'mr-2': inline && i !== count - 1 },
              className
            )}
            style={style}
          />
        ))}
    </>
  );
});

/**
 * 表单字段骨架屏
 */
export const FormFieldSkeleton = memo(function FormFieldSkeleton() {
  return (
    <div className="mb-4">
      <Skeleton height={16} width={100} className="mb-2" />
      <Skeleton height={38} width="100%" />
    </div>
  );
});

/**
 * 配置面板骨架屏
 */
export const ConfigurationPanelSkeleton = memo(function ConfigurationPanelSkeleton() {
  return (
    <div className="p-4 border rounded-md bg-white dark:bg-gray-800">
      <Skeleton height={24} width={150} className="mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <FormFieldSkeleton key={i} />
          ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton height={38} width={100} />
        <Skeleton height={38} width={100} />
      </div>
    </div>
  );
});

/**
 * 命令输出骨架屏
 */
export const CommandOutputSkeleton = memo(function CommandOutputSkeleton() {
  return (
    <div className="p-4 border rounded-md bg-white dark:bg-gray-800">
      <Skeleton height={24} width={150} className="mb-4" />
      <Skeleton height={160} width="100%" className="rounded-md" />
    </div>
  );
});

/**
 * 数据列表骨架屏
 */
export const DataTableSkeleton = memo(function DataTableSkeleton() {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-2 bg-muted flex gap-2">
        <Skeleton height={32} width={80} />
        <Skeleton height={32} width={80} />
      </div>
      <div className="p-4">
        <Skeleton height={40} width="100%" className="mb-2" />
        <Skeleton height={40} width="100%" className="mb-2" />
        <Skeleton height={40} width="100%" className="mb-2" />
        <Skeleton height={40} width="100%" className="mb-2" />
        <Skeleton height={40} width="100%" />
      </div>
    </div>
  );
}); 