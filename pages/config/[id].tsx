import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Header } from '@/components/header'
import Link from 'next/link'
import { storage } from '@/lib/storage'
import { handleError, formatDate } from '@/lib/utils'
import { DeviceConfig } from '@/types'

export default function ConfigDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [config, setConfig] = useState<DeviceConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function fetchConfiguration() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('configurations')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        if (data) setConfig(data)
      } catch (error) {
        await handleError('获取配置数据失败', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfiguration()
  }, [id])

  const exportConfig = () => {
    if (!config) return
    
    try {
      const blob = new Blob([config.command_output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `config-${config.serial}-${formatDate(config.created_at)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      handleError('导出配置失败', error)
    }
  }

  const loadToEditor = () => {
    // 将数据存储到storage，然后导航到编辑器页面
    if (config) {
      storage.set('loadedConfig', config)
      router.push('/')
    }
  }

  if (loading) return <div>加载中...</div>
  if (!config) return <div>未找到配置</div>

  return (
    <div className="flex flex-col h-screen">
      <Header sidebarCollapsed={false} setSidebarCollapsed={() => {}} />
      <div className="flex flex-1 p-4 overflow-auto">
        <div className="w-full">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">配置详情</h1>
            <div className="space-x-2">
              <button className="btn btn-primary" onClick={loadToEditor}>
                加载到编辑器
              </button>
              <button className="btn btn-accent" onClick={exportConfig}>
                导出配置
              </button>
              <Link href="/history" className="btn btn-secondary">
                返回列表
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="card bg-base-200 p-4">
              <h2 className="text-xl font-bold mb-2">基本信息</h2>
              <div className="grid grid-cols-2 gap-2">
                <div>设备类型:</div>
                <div>{config.device_type === 'huawei' ? '华为' : '中兴'}</div>
                
                <div>配置类型:</div>
                <div>{config.config_type}</div>
                
                <div>序列号:</div>
                <div>{config.serial}</div>
                
                <div>创建时间:</div>
                <div>{formatDate(config.created_at)}</div>
              </div>
            </div>
            
            <div className="card bg-base-200 p-4">
              <h2 className="text-xl font-bold mb-2">配置参数</h2>
              <div className="grid grid-cols-2 gap-2">
                <div>槽位:</div>
                <div>{config.slot}</div>
                
                <div>PON口:</div>
                <div>{config.pon_port}</div>
                
                <div>设备号:</div>
                <div>{config.device_num}</div>
                
                <div>业务VLAN:</div>
                <div>{config.biz_vlan}</div>
                
                <div>IPTV VLAN:</div>
                <div>{config.iptv_vlan}</div>
                
                {config.ip_addr && (
                  <>
                    <div>IP地址:</div>
                    <div>{config.ip_addr}</div>
                  </>
                )}
                
                {config.voice_ip_addr && (
                  <>
                    <div>语音IP地址:</div>
                    <div>{config.voice_ip_addr}</div>
                  </>
                )}
                
                {config.multicast_vlan && (
                  <>
                    <div>组播VLAN:</div>
                    <div>{config.multicast_vlan}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="card bg-base-200 p-4">
            <h2 className="text-xl font-bold mb-2">配置命令</h2>
            <pre className="p-4 bg-gray-800 text-white rounded overflow-auto max-h-96">
              {config.command_output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 