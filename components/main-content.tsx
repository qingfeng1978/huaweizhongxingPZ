"use client"

import type React from "react"

import { useState, useEffect, useCallback, memo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Play, FileText, Database, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { HelpDialog } from "@/components/help-dialog"
import { useAuth, useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { FormData } from "@/types"
import { cn } from "@/lib/utils"

interface MainContentProps {
  selectedConfigs: string[]
  commandOutput: string
  generateCommand: (activeTab: string) => void | Promise<void>
  addData: () => void
  exportData: () => void
  formData: FormData
  onFormChange: (field: keyof FormData, value: string | boolean) => void
  onViewData?: () => void
  onCommandOutputChange?: (value: string) => void
  _onCopy?: (text: string) => void | Promise<void>
}

// 使用React.memo包装组件，只有当props变化时才重新渲染
export const MainContent = memo(function MainContent({
  selectedConfigs,
  commandOutput,
  generateCommand,
  addData,
  exportData,
  formData,
  onFormChange,
  onViewData,
  onCommandOutputChange,
  _onCopy,
}: MainContentProps) {
  const [activeTab, setActiveTab] = useState("huawei-deploy")
  const [helpOpen, setHelpOpen] = useState(false)
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // Update active tab when selected configs change
  useEffect(() => {
    if (selectedConfigs.includes("huawei")) {
      setActiveTab("huawei-deploy")
    } else if (selectedConfigs.includes("zte")) {
      setActiveTab("zte-c300")
    }
  }, [selectedConfigs])

  // 使用useCallback记忆事件处理函数
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    onFormChange(
      name as keyof FormData,
      type === "checkbox" ? checked : value
    )
  }, [onFormChange])

  const handleGenerateCommand = useCallback(() => {
    generateCommand(activeTab)
  }, [generateCommand, activeTab])

  // 处理命令输出变更
  const handleCommandOutputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onCommandOutputChange) {
      onCommandOutputChange(e.target.value);
    }
  }, [onCommandOutputChange]);

  // 记忆化渲染函数，仅在formData变化时重新创建
  const renderInputFields = useCallback((includeIpFields = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <div>
        <Input
          id="serial"
          name="serial"
          value={formData.serial}
          onChange={handleInputChange}
          placeholder="输入设备序列号"
        />
      </div>
      <div>
        <Input
          id="slot"
          name="slot"
          value={formData.slot}
          onChange={handleInputChange}
          placeholder="输入设备槽位"
        />
      </div>
      <div>
        <Input
          id="ponPort"
          name="ponPort"
          value={formData.ponPort}
          onChange={handleInputChange}
          placeholder="输入PON口"
        />
      </div>
      <div>
        <Input
          id="deviceNum"
          name="deviceNum"
          value={formData.deviceNum}
          onChange={handleInputChange}
          placeholder="输入设备序号"
        />
      </div>
      <div>
        <Input
          id="bizVlan"
          name="bizVlan"
          value={formData.bizVlan}
          onChange={handleInputChange}
          placeholder="输入业务VLAN"
        />
      </div>
      <div>
        <Input
          id="iptvVlan"
          name="iptvVlan"
          value={formData.iptvVlan}
          onChange={handleInputChange}
          placeholder="输入IPTV-VLAN"
        />
      </div>
      {includeIpFields && (
        <>
          <div>
            <Input
              id="ipaddr"
              name="ipaddr"
              value={formData.ipaddr}
              onChange={handleInputChange}
              placeholder="输入IP地址"
            />
          </div>
          <div>
            <Input
              id="voiceipaddr"
              name="voiceipaddr"
              value={formData.voiceipaddr}
              onChange={handleInputChange}
              placeholder="输入语音IP地址"
            />
          </div>
        </>
      )}
    </div>
  ), [formData, handleInputChange]);

  const renderMulticastFields = useCallback(() => (
    <div className="mt-4">
      <div className="max-w-xs">
        <Input
          id="multicastVlan"
          name="multicastVlan"
          value={formData.multicastVlan}
          onChange={handleInputChange}
          placeholder="输入组播VLAN"
        />
      </div>
    </div>
  ), [formData.multicastVlan, handleInputChange]);

  // 渲染用户信息
  const renderUserInfo = useCallback(() => {
    if (!isLoaded) return null;
    
    return isSignedIn ? (
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">欢迎, {user?.firstName || user?.username || '用户'}</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    ) : null;
  }, [isLoaded, isSignedIn, user]);

  return (
    <div className="flex-1 overflow-auto p-4 bg-muted/30">
      <div className="flex flex-col h-full gap-4">
        {/* 用户信息显示 */}
        {renderUserInfo()}

        {/* 标签页与表单 */}
        <Card className="flex-1">
          <CardContent className="p-4 h-full">
            <div className="mb-4">
              <h3 className="text-lg font-medium">配置选项</h3>
            </div>
            <Tabs
              defaultValue="huawei-deploy"
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="bg-muted/50 p-1">
                {selectedConfigs.includes("huawei") && (
                  <>
                    <TabsTrigger 
                      value="huawei-deploy" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all",
                        "hover:bg-muted/80 rounded-md",
                        "data-[state=active]:shadow-sm data-[state=active]:font-medium"
                      )}
                    >
                      华为下发
                    </TabsTrigger>
                    <TabsTrigger 
                      value="huawei-manual" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all",
                        "hover:bg-muted/80 rounded-md",
                        "data-[state=active]:shadow-sm data-[state=active]:font-medium"
                      )}
                    >
                      华为手工
                    </TabsTrigger>
                    <TabsTrigger 
                      value="huawei-onu" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all",
                        "hover:bg-muted/80 rounded-md",
                        "data-[state=active]:shadow-sm data-[state=active]:font-medium"
                      )}
                    >
                      华为ONU
                    </TabsTrigger>
                    <TabsTrigger 
                      value="huawei-multicast" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all",
                        "hover:bg-muted/80 rounded-md",
                        "data-[state=active]:shadow-sm data-[state=active]:font-medium"
                      )}
                    >
                      华为组播
                    </TabsTrigger>
                  </>
                )}
                {selectedConfigs.includes("zte") && (
                  <>
                    <TabsTrigger 
                      value="zte-c300" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all",
                        "hover:bg-muted/80 rounded-md",
                        "data-[state=active]:shadow-sm data-[state=active]:font-medium"
                      )}
                    >
                      中兴C300
                    </TabsTrigger>
                    <TabsTrigger 
                      value="zte-c600-manual" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all",
                        "hover:bg-muted/80 rounded-md",
                        "data-[state=active]:shadow-sm data-[state=active]:font-medium"
                      )}
                    >
                      中兴C600手工
                    </TabsTrigger>
                    <TabsTrigger 
                      value="zte-c600-deploy" 
                      className={cn(
                        "data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all",
                        "hover:bg-muted/80 rounded-md",
                        "data-[state=active]:shadow-sm data-[state=active]:font-medium"
                      )}
                    >
                      中兴C600下发
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="huawei-deploy" className="flex-1 space-y-4">
                {renderInputFields()}
              </TabsContent>

              <TabsContent value="huawei-manual" className="flex-1 space-y-4">
                {renderInputFields()}
              </TabsContent>

              <TabsContent value="huawei-onu" className="flex-1 space-y-4">
                {renderInputFields(true)}
              </TabsContent>

              <TabsContent value="huawei-multicast" className="flex-1 space-y-4">
                {renderMulticastFields()}
              </TabsContent>

              <TabsContent value="zte-c300" className="flex-1 space-y-4">
                {renderInputFields()}
              </TabsContent>

              <TabsContent value="zte-c600-manual" className="flex-1 space-y-4">
                {renderInputFields()}
              </TabsContent>

              <TabsContent value="zte-c600-deploy" className="flex-1 space-y-4">
                {renderInputFields()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 按钮操作区 */}
        <Card className="flex-none">
          <CardContent className="p-4 flex justify-between">
            <div className="flex space-x-2">
              <Button onClick={handleGenerateCommand}>
                <Play className="mr-2 h-4 w-4" />
                配置生成
              </Button>
              <Button onClick={addData} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                添加数据
              </Button>
              <Button onClick={exportData} variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                导出数据
              </Button>
            </div>

            {/* 查看数据按钮 - 根据认证状态显示不同内容 */}
            {onViewData && (
              isSignedIn ? (
                <Button variant="outline" onClick={onViewData}>
                  <Database className="mr-2 h-4 w-4" />
                  查看数据
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button variant="outline">
                    <Lock className="mr-2 h-4 w-4" />
                    登录查看数据
                  </Button>
                </SignInButton>
              )
            )}
          </CardContent>
        </Card>

        {/* 命令输出 */}
        <Card className="flex-1 min-h-[200px]">
          <CardContent className="p-4 h-full">
            <h3 className="text-lg font-medium mb-2">命令输出</h3>
            <div className="bg-background border rounded-md p-3 h-[calc(100%-2.5rem)]">
              {commandOutput ? (
                <textarea
                  className="text-sm font-mono whitespace-pre-wrap w-full h-full min-h-[200px] bg-transparent resize-none focus:outline-none"
                  value={commandOutput}
                  onChange={handleCommandOutputChange}
                ></textarea>
              ) : (
                <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                  点击&quot;配置生成&quot;按钮生成命令
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <HelpDialog open={helpOpen} setOpen={setHelpOpen} />
    </div>
  )
});

