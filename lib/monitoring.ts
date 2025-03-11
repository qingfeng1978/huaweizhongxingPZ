import { logError } from './utils';

interface PerformanceMetric {
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100;

  // 开始测量性能
  startMeasure(name: string, metadata?: Record<string, any>): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.addMetric({ name, startTime, duration, metadata });
    };
  }

  // 添加性能指标
  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // 保持最近的性能指标
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // 记录较慢的操作
    if (metric.duration > 1000) {
      console.warn(`性能警告: ${metric.name} 操作耗时 ${metric.duration.toFixed(2)}ms`, metric.metadata);
    }
  }

  // 获取性能指标统计
  getMetrics() {
    return this.metrics;
  }

  // 获取操作平均耗时
  getAverageMetrics(): Record<string, number> {
    const totals: Record<string, { sum: number; count: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!totals[metric.name]) {
        totals[metric.name] = { sum: 0, count: 0 };
      }
      totals[metric.name].sum += metric.duration;
      totals[metric.name].count += 1;
    });

    return Object.entries(totals).reduce((acc, [name, { sum, count }]) => {
      acc[name] = sum / count;
      return acc;
    }, {} as Record<string, number>);
  }

  // 清除性能指标
  clearMetrics() {
    this.metrics = [];
  }
}

// 创建单例实例
export const performanceMonitor = new PerformanceMonitor();

// 错误监控
interface ErrorMetric {
  message: string;
  stack?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class ErrorMonitor {
  private errors: ErrorMetric[] = [];
  private readonly maxErrors = 50;

  // 记录错误
  logError(error: Error | string, metadata?: Record<string, any>) {
    const errorMetric: ErrorMetric = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      metadata
    };

    this.errors.push(errorMetric);
    
    // 保持最近的错误记录
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 调用已有的错误日志函数
    logError(errorMetric.message, metadata);
  }

  // 获取错误记录
  getErrors() {
    return this.errors;
  }

  // 清除错误记录
  clearErrors() {
    this.errors = [];
  }
}

// 创建单例实例
export const errorMonitor = new ErrorMonitor();

// 用于包装异步函数的性能监控装饰器
export function measureAsync<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    const endMeasure = performanceMonitor.startMeasure(name, { args });
    try {
      const result = await fn(...args);
      endMeasure();
      return result;
    } catch (error) {
      endMeasure();
      errorMonitor.logError(error as Error, { name, args });
      throw error;
    }
  }) as T;
} 