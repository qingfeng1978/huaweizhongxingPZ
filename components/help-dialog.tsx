"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HelpDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function HelpDialog({ open, setOpen }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>使用帮助</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h3>基本使用</h3>
          <ol>
            <li>从侧边栏选择设备类型（华为或中兴）</li>
            <li>选择具体的配置类型（例如：华为下发配置）</li>
            <li>填写必要的配置参数</li>
            <li>点击&quot;配置生成&quot;按钮生成命令</li>
            <li>可选：点击&quot;添加数据&quot;将配置保存到数据库</li>
            <li>可选：点击&quot;导出数据&quot;将配置导出为文本文件</li>
          </ol>

          <h3>配置说明</h3>
          <ul>
            <li><strong>华为配置</strong>：适用于华为设备的各种配置</li>
            <li><strong>中兴配置</strong>：适用于中兴设备的各种配置</li>
            <li><strong>语音配置</strong>：启用后会在生成的命令中添加语音相关配置</li>
          </ul>

          <h3>数据说明</h3>
          <p>生成的配置数据可以保存到数据库中，方便后续查看和使用。点击&quot;查看数据&quot;按钮可以管理已保存的配置数据。</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

