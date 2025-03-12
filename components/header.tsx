"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, HelpCircle, Zap } from "lucide-react"
import { useState } from "react"
import { HelpDialog } from "@/components/help-dialog"
import Link from "next/link"

interface HeaderProps {
  sidebarCollapsed?: boolean
  setSidebarCollapsed?: (collapsed: boolean) => void
}

export function Header({ sidebarCollapsed, setSidebarCollapsed }: HeaderProps) {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <header className="border-b border-border h-14 px-4 flex items-center justify-between bg-background">
      <div className="flex items-center gap-3">
        {setSidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        <Link href="/" className="text-xl font-semibold tracking-tight hover:text-primary transition-colors">华为中兴配置工具</Link>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/batch-deploy">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">批量数据下发</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)}>
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
        <ModeToggle />
      </div>
      <HelpDialog open={helpOpen} setOpen={setHelpOpen} />
    </header>
  )
}

