"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllConfigs, deleteConfig } from "@/lib/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileText, Trash2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { handleError, formatDate } from "@/lib/utils"
import { DeviceConfig } from "@/types"
import { SkeletonTable } from "./ui/skeleton"
import { useToast } from "./ui/toast-message"

interface DataViewerProps {
  onClose: () => void
  onConfigLoad: (config: DeviceConfig) => void
}

// 使用React.memo来记忆化组件，减少不必要的重渲染
export const DataViewer = memo(function DataViewer({ onClose, onConfigLoad }: DataViewerProps) {
  const [configs, setConfigs] = useState<DeviceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConfig, setSelectedConfig] = useState<DeviceConfig | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  
  // 使用 Clerk 的 useUser hook 获取当前用户信息
  const { isLoaded, user } = useUser()
  
  // 检查用户是否有管理员权限
  const isAdmin = user?.publicMetadata?.role === 'admin'
  
  // 使用Toast组件显示消息
  const { showToast } = useToast()

  // 使用useCallback记忆化函数，减少重渲染
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllConfigs()
      setConfigs(data)
    } catch (error) {
      await handleError('加载配置数据失败', error)
      showToast({
        message: '加载配置数据失败',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // 在组件加载时获取所有配置
  useEffect(() => {
    loadConfigs()
  }, [loadConfigs])

  const handleDelete = useCallback(async (id: string) => {
    // 首先检查用户是否有管理员权限
    if (!isAdmin) {
      showToast({
        message: '您没有删除数据的权限',
        type: 'warning'
      })
      return
    }
    
    if (window.confirm('确定要删除此配置吗？')) {
      try {
        await deleteConfig(id)
        setConfigs(configs => configs.filter(config => config.id !== id))
        if (selectedConfig?.id === id) {
          setDetailsOpen(false)
        }
        showToast({
          message: '配置删除成功',
          type: 'success'
        })
      } catch (error) {
        await handleError('删除配置失败', error)
        showToast({
          message: '删除配置失败',
          type: 'error'
        })
      }
    }
  }, [isAdmin, selectedConfig, showToast])

  const viewDetails = useCallback((config: DeviceConfig) => {
    setSelectedConfig(config)
    setDetailsOpen(true)
  }, [])

  const handleLoad = useCallback((config: DeviceConfig) => {
    onConfigLoad(config)
    showToast({
      message: '配置加载成功',
      type: 'success'
    })
    onClose()
  }, [onConfigLoad, onClose, showToast])

  // 格式化日期为YYYY-MM-DD
  const formatDateString = useCallback((dateString?: string) => {
    return formatDate(dateString);
  }, [])

  // 获取设备类型显示文本
  const getDeviceTypeText = useCallback((type?: string) => {
    if (type === 'huawei') return '华为OLT';
    if (type === 'zte') return '中兴OLT';
    return type || '-';
  }, [])

  // 获取位置显示格式
  const formatPosition = useCallback((config: DeviceConfig) => {
    return `${config.frame_no || '0'}/${config.slot}/${config.pon_port}`;
  }, [])

  // 如果用户信息还未加载完成，显示加载状态
  if (!isLoaded) {
    return (
      <Card className="flex-grow">
        <CardContent className="p-4 flex items-center justify-center h-full">
          <p>加载用户信息中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-grow overflow-hidden">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">配置数据管理</h2>
            <Button variant="outline" onClick={onClose}>关闭</Button>
          </div>

          {loading ? (
            <div className="flex-grow">
              <SkeletonTable columns={6} rows={5} />
            </div>
          ) : configs.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-muted-foreground">暂无配置数据</p>
            </div>
          ) : (
            <div className="flex-grow overflow-auto">
              {/* 自定义表格布局 */}
              <div className="w-full">
                {/* 表头 */}
                <div className="grid grid-cols-6 border-b p-3 bg-muted/20 font-medium text-sm">
                  <div>设备类型</div>
                  <div>序列号</div>
                  <div>框号/槽位/PON口</div>
                  <div>创建时间</div>
                  <div>原因</div>
                  <div>操作</div>
                </div>
                
                {/* 表内容 */}
                <div className="divide-y">
                  {configs.map((config) => (
                    <div key={config.id} className="grid grid-cols-6 p-3 hover:bg-muted/30">
                      <div>{getDeviceTypeText(config.device_type)}</div>
                      <div>{config.serial}</div>
                      <div>{formatPosition(config)}</div>
                      <div>{formatDateString(config.created_at)}</div>
                      <div>{config.reason || '-'}</div>
                      <div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => viewDetails(config)}>
                            <FileText className="h-4 w-4 mr-1" />
                            详情
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleLoad(config)}>
                            加载
                          </Button>
                          
                          {/* 仅管理员可见的删除按钮 */}
                          {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => handleDelete(config.id!)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 配置详情对话框 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>配置详情</DialogTitle>
            <DialogDescription>
              设备: {getDeviceTypeText(selectedConfig?.device_type)} | 
              序列号: {selectedConfig?.serial} | 
              位置: {selectedConfig ? formatPosition(selectedConfig) : ''} | 
              创建时间: {formatDateString(selectedConfig?.created_at)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="command">命令输出</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium">设备类型:</p>
                    <p>{getDeviceTypeText(selectedConfig?.device_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">序列号:</p>
                    <p>{selectedConfig?.serial}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">框号/槽位/PON口:</p>
                    <p>{selectedConfig ? formatPosition(selectedConfig) : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">设备号:</p>
                    <p>{selectedConfig?.device_num}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">业务VLAN:</p>
                    <p>{selectedConfig?.biz_vlan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">IPTV VLAN:</p>
                    <p>{selectedConfig?.iptv_vlan}</p>
                  </div>
                  {selectedConfig?.ip_addr && (
                    <div>
                      <p className="text-sm font-medium">IP地址:</p>
                      <p>{selectedConfig.ip_addr}</p>
                    </div>
                  )}
                  {selectedConfig?.voice_ip_addr && (
                    <div>
                      <p className="text-sm font-medium">语音IP地址:</p>
                      <p>{selectedConfig.voice_ip_addr}</p>
                    </div>
                  )}
                  {selectedConfig?.multicast_vlan && (
                    <div>
                      <p className="text-sm font-medium">组播VLAN:</p>
                      <p>{selectedConfig.multicast_vlan}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">制作原因:</p>
                    <p>{selectedConfig?.reason || '-'}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="command">
                <div className="mt-4 p-3 bg-muted rounded-md overflow-auto max-h-[400px]">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {selectedConfig?.command_output}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>关闭</Button>
            <Button onClick={() => {
              if (selectedConfig) {
                handleLoad(selectedConfig)
              }
            }}>加载此配置</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}); 