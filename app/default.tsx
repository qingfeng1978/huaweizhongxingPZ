import { ConfigurationTool } from "@/components/configuration-tool"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"

export default function Default() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
        <ConfigurationTool />
      </Suspense>
    </ErrorBoundary>
  )
} 