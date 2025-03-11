import { cn } from "@/lib/utils"

/**
 * 骨架屏组件
 * 用于加载内容时显示占位效果
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/**
 * 骨架屏文本组件
 * 用于显示文本加载中的效果
 */
export function SkeletonText({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("h-4 w-[200px]", className)}
      {...props}
    />
  )
}

/**
 * 骨架屏卡片组件
 * 用于卡片内容加载中的效果
 */
export function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="space-y-2">
        <SkeletonText className="h-4 w-[250px]" />
        <SkeletonText className="h-4 w-[200px]" />
      </div>
    </div>
  )
}

/**
 * 骨架屏表格组件
 * 用于表格内容加载中的效果
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  rows?: number
  columns?: number
}) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {/* 表头 */}
      <div className="grid gap-2 py-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array(columns)
          .fill(null)
          .map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-5 w-full" />
          ))}
      </div>
      
      {/* 表格内容 */}
      <div className="space-y-3">
        {Array(rows)
          .fill(null)
          .map((_, rowIndex) => (
            <div 
              key={`row-${rowIndex}`} 
              className="grid gap-2 py-3 border-b border-muted" 
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array(columns)
                .fill(null)
                .map((_, colIndex) => (
                  <Skeleton 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    className="h-4 w-full" 
                  />
                ))}
            </div>
          ))}
      </div>
    </div>
  )
} 