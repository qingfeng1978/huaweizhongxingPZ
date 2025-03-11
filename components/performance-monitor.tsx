import { memo, useEffect, useState } from 'react';
import { performanceMonitor, errorMonitor } from '@/lib/monitoring';

interface PerformanceStats {
  [key: string]: number;
}

/**
 * 性能监控组件
 * 仅在开发环境中显示
 */
export const PerformanceMonitor = memo(function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({});
  const [errors, setErrors] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 每5秒更新一次统计数据
    const timer = setInterval(() => {
      setStats(performanceMonitor.getAverageMetrics());
      setErrors(errorMonitor.getErrors().length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 z-50"
        title="显示性能监控"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">性能监控</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          错误数: {errors}
        </div>
        
        {Object.entries(stats).map(([name, duration]) => (
          <div key={name} className="flex justify-between items-center text-sm">
            <span className="text-gray-700 dark:text-gray-300">{name}:</span>
            <span className={duration > 1000 ? 'text-red-500' : 'text-green-500'}>
              {duration.toFixed(2)}ms
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            performanceMonitor.clearMetrics();
            setStats({});
          }}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          清除性能数据
        </button>
        <button
          onClick={() => {
            errorMonitor.clearErrors();
            setErrors(0);
          }}
          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          清除错误记录
        </button>
      </div>
    </div>
  );
}); 