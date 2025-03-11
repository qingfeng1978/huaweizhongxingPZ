import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Header } from '@/components/header'
import Link from 'next/link'

interface Configuration {
  id: string
  created_at: string
  device_type: string
  config_type: string
  serial: string
  command_output: string
}

export default function HistoryPage() {
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConfigurations() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('configurations')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        if (data) setConfigurations(data)
      } catch (error) {
        console.error('获取数据失败:', error)
        alert('获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchConfigurations()
  }, [])

  const exportConfig = (config: Configuration) => {
    const blob = new Blob([config.command_output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `config-${config.serial}-${new Date(config.created_at).toISOString().substring(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-screen">
      <Header sidebarCollapsed={false} setSidebarCollapsed={() => {}} />
      <div className="flex flex-1 p-4 overflow-auto">
        <div className="w-full">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">配置历史记录</h1>
            <Link href="/" className="btn btn-primary">
              返回首页
            </Link>
          </div>
          
          {loading ? (
            <p>加载中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>创建时间</th>
                    <th>设备类型</th>
                    <th>配置类型</th>
                    <th>序列号</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {configurations.map((config) => (
                    <tr key={config.id}>
                      <td>{new Date(config.created_at).toLocaleString()}</td>
                      <td>{config.device_type === 'huawei' ? '华为' : '中兴'}</td>
                      <td>{config.config_type}</td>
                      <td>{config.serial}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-accent mr-2"
                          onClick={() => exportConfig(config)}
                        >
                          导出
                        </button>
                        <Link 
                          href={`/config/${config.id}`}
                          className="btn btn-sm btn-info"
                        >
                          查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 