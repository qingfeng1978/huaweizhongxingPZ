"use client"

import { useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

interface SidebarProps {
  collapsed: boolean
  selectedConfigs: string[]
  toggleConfig: (config: string) => void
  setCollapsed: (collapsed: boolean) => void
  selectedMode: string
  onModeSelect?: (mode: string) => void
}

// 使用React.memo减少不必要的重渲染
export const Sidebar = memo(function Sidebar({ 
  collapsed, 
  selectedConfigs, 
  toggleConfig, 
  setCollapsed, 
  selectedMode, 
  onModeSelect 
}: SidebarProps) {
  // 模式选择处理 - 使用useCallback记忆化函数
  const handleModeChange = useCallback((value: string) => {
    if (onModeSelect) {
      onModeSelect(value)
    }
  }, [onModeSelect])

  // 记忆化折叠/展开函数
  const handleCollapse = useCallback(() => setCollapsed(true), [setCollapsed])
  const handleExpand = useCallback(() => setCollapsed(false), [setCollapsed])

  // 记忆化配置切换函数
  const toggleHuaweiConfig = useCallback(() => toggleConfig("huawei"), [toggleConfig])
  const toggleZteConfig = useCallback(() => toggleConfig("zte"), [toggleConfig])
  const toggleVoiceConfig = useCallback(() => toggleConfig("voice"), [toggleConfig])

  return (
    <div className="relative">
      <div
        className={cn(
          "h-[calc(100vh-3.5rem)] border-r border-border bg-background transition-all duration-300 ease-in-out",
          collapsed ? "w-0 md:w-16" : "w-64",
        )}
      >
        <div className="p-4 space-y-4">
          {!collapsed && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">配置选项</h2>
              <Button variant="ghost" size="icon" onClick={handleCollapse}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Full sidebar view */}
          <div className={cn("space-y-4", collapsed && "hidden")}>
            {/* 设备类型选择 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">设备类型</h3>
              <Button
                variant={selectedConfigs.includes("huawei") ? "default" : "outline"}
                className="w-full justify-start"
                onClick={toggleHuaweiConfig}
              >
                华为配置
              </Button>

              <Button
                variant={selectedConfigs.includes("zte") ? "default" : "outline"}
                className="w-full justify-start"
                onClick={toggleZteConfig}
              >
                中兴配置
              </Button>

              <Button
                variant={selectedConfigs.includes("voice") ? "default" : "outline"}
                className="w-full justify-start"
                onClick={toggleVoiceConfig}
              >
                语音配置
              </Button>
            </div>

            {/* 模式选择下拉框 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">选择模式</h3>
              <Select value={selectedMode} onValueChange={handleModeChange}>
                <SelectTrigger className={cn("w-full", selectedMode && "border-primary text-primary font-medium")}>
                  <SelectValue placeholder="选择模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="下发失败" className={selectedMode === "下发失败" ? "bg-primary/10 text-primary font-medium" : ""}>下发失败</SelectItem>
                  <SelectItem value="华为ONU" className={selectedMode === "华为ONU" ? "bg-primary/10 text-primary font-medium" : ""}>华为ONU</SelectItem>
                  <SelectItem value="加装IPTV" className={selectedMode === "加装IPTV" ? "bg-primary/10 text-primary font-medium" : ""}>加装IPTV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Collapsed sidebar view */}
          {collapsed && (
            <div className="flex flex-col items-center space-y-4 pt-4">
              <Button variant="ghost" size="icon" onClick={handleExpand} className="mb-6">
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant={selectedConfigs.includes("huawei") ? "default" : "outline"}
                size="icon"
                onClick={toggleHuaweiConfig}
                title="华为配置"
              >
                H
              </Button>

              <Button
                variant={selectedConfigs.includes("zte") ? "default" : "outline"}
                size="icon"
                onClick={toggleZteConfig}
                title="中兴配置"
              >
                Z
              </Button>

              <Button
                variant={selectedConfigs.includes("voice") ? "default" : "outline"}
                size="icon"
                onClick={toggleVoiceConfig}
                title="语音配置"
              >
                V
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
});

