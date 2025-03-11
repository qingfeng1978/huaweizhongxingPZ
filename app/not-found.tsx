import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Alert className="max-w-md">
        <AlertTitle className="text-lg font-semibold">页面未找到</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            您访问的页面不存在或已被移除。
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
} 