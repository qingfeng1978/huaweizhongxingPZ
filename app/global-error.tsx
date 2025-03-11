'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { RefreshCw } from 'lucide-react'
import { Geist } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('全局错误:', error)
  }, [error])

  return (
    <html lang="zh">
      <body className={`${geistSans.variable} antialiased`}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle className="text-lg font-semibold">应用程序错误</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">
                应用程序发生严重错误。我们已记录此问题并将尽快修复。
              </p>
              {error.message && (
                <p className="text-sm mb-2 break-words">
                  错误信息: {error.message}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => reset()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </body>
    </html>
  )
} 