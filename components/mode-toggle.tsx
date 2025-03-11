"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onClick={() => setTheme("light")}>
        <Sun className="h-5 w-5" />
        <span className="sr-only">Light mode</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setTheme("dark")}>
        <Moon className="h-5 w-5" />
        <span className="sr-only">Dark mode</span>
      </Button>
    </div>
  )
}

