"use client";

import { useState } from "react";
import { 
  Button, 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Textarea,
  Label,
  Input,
  useToast
} from "@/components/ui";
import { ArrowDownToLine, Copy, FileUp, Scissors, TerminalSquare, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { Header } from "@/components/header";
import { Suspense } from "react";

export default function BatchDeployPage() {
  const [outputCommands, setOutputCommands] = useState("");
  const [importedData, setImportedData] = useState("");
  const [formData, setFormData] = useState({
    // 新的参数字段
    bizVlanStart: "",
    bizVlanEnd: "",
    iptvVlanStart: "",
    iptvVlanEnd: "",
  });

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showToast } = useToast();

  // 渐变背景样式
  const gradientStyle = {
    background: isDark
      ? "linear-gradient(to bottom right, rgba(13, 17, 23, 0.7), rgba(42, 47, 65, 0.7))"
      : "linear-gradient(to bottom right, rgba(240, 244, 248, 0.7), rgba(214, 219, 233, 0.7))",
    backdropFilter: "blur(10px)",
    borderRadius: "0.5rem",
    border: isDark ? "1px solid rgba(70, 70, 80, 0.2)" : "1px solid rgba(220, 220, 230, 0.5)",
  };

  // 从OLT自动发现数据中提取数据
  const extractDataFromAutofind = (autofindText: string) => {
    try {
      // 按分割线分割数据块
      const blocks = autofindText.split('----------------------------------------------------------------------------');
      
      const extractedData: string[] = [];
      
      // 记录上一条记录的框/槽/端口信息和当前设备号
      let lastFrame = "";
      let lastSlot = "";
      let lastPort = "";
      let currentDeviceNum = 80; // 设备号默认从80开始
      
      blocks.forEach(block => {
        if (!block.trim()) return;
        
        // 提取ONT SN
        const snMatch = block.match(/ONT SN\s+:\s+([A-Z0-9]+)\s*\(/);
        if (!snMatch) return;
        const serialNumber = snMatch[1] || "";
        
        // 提取逻辑标识
        const loidMatch = block.match(/逻辑标识\s+:\s+([A-Za-z0-9]+)/);
        let loid = "";
        
        // 判断逻辑标识是否以0734开头，如果不是则留空
        if (loidMatch && loidMatch[1]) {
          const loidValue = loidMatch[1].trim();
          loid = loidValue.startsWith("0734") ? loidValue : "";
        }
        
        // 提取框/槽/端口
        const portMatch = block.match(/框\/槽\/端口\s+:\s+(\d+)\/(\d+)\/(\d+)/);
        if (!portMatch) return;
        
        const frame = portMatch[1] || "";
        const slot = portMatch[2] || "";
        const port = portMatch[3] || "";
        
        // 判断是否需要重置设备号
        if (frame !== lastFrame || slot !== lastSlot || port !== lastPort) {
          // 框号、槽位或PON口有变化，重置设备号为80
          currentDeviceNum = 80;
        } else {
          // 框号、槽位和PON口相同，设备号递增
          currentDeviceNum++;
        }
        
        // 更新上一条记录的信息
        lastFrame = frame;
        lastSlot = slot;
        lastPort = port;
        
        // 按要求格式化数据，加上设备号
        extractedData.push(`${serialNumber},${loid},${frame},${slot},${port},${currentDeviceNum}`);
      });
      
      if (extractedData.length > 0) {
        setImportedData(extractedData.join('\n'));
        showToast({
          message: `成功提取 ${extractedData.length} 条设备数据`,
          type: 'success'
        });
      } else {
        showToast({
          message: '未能从输入数据中提取有效设备信息',
          type: 'warning'
        });
      }
    } catch (error) {
      console.error("数据提取错误:", error);
      showToast({
        message: '数据提取过程中出错，请检查输入格式',
        type: 'error'
      });
    }
  };

  // 生成批量命令
  const generateBatchCommands = () => {
    try {
      // 验证导入数据是否存在
      if (!importedData.trim()) {
        showToast({
          message: '请先导入数据',
          type: 'error'
        });
        return;
      }
      
      // 验证必填字段
      if (!formData.bizVlanStart || !formData.bizVlanEnd) {
        showToast({
          message: '请输入业务VLAN范围',
          type: 'warning'
        });
        return;
      }
      
      if (!formData.iptvVlanStart || !formData.iptvVlanEnd) {
        showToast({
          message: '请输入IPTV VLAN范围',
          type: 'warning'
        });
        return;
      }
      
      const lines = importedData.trim().split("\n");
      let generatedCommands = "";
      
      // 解析VLAN范围
      const bizVlanStart = parseInt(formData.bizVlanStart);
      const bizVlanEnd = parseInt(formData.bizVlanEnd);
      const iptvVlanStart = parseInt(formData.iptvVlanStart);
      const iptvVlanEnd = parseInt(formData.iptvVlanEnd);
      
      // 验证VLAN范围值是否有效
      if (isNaN(bizVlanStart) || isNaN(bizVlanEnd) || bizVlanStart > bizVlanEnd) {
        showToast({
          message: '业务VLAN范围无效',
          type: 'error'
        });
        return;
      }
      
      if (isNaN(iptvVlanStart) || isNaN(iptvVlanEnd) || iptvVlanStart > iptvVlanEnd) {
        showToast({
          message: 'IPTV VLAN范围无效',
          type: 'error'
        });
        return;
      }
      
      // 记录上一个框/槽/端口和当前使用的VLAN值
      let lastFrame = "";
      let lastSlot = "";
      let lastPort = "";
      let currentBizVlan = bizVlanStart;
      let currentIptvVlan = iptvVlanStart;
      
      lines.forEach((line, index) => {
        // 解析每行数据
        const data = line.split(",");
        if (data.length < 6) { // 修改为6，因为我们现在有6个字段
          showToast({
            message: `第${index + 1}行数据格式不正确，已跳过`,
            type: 'warning'
          });
          return;
        }
        
        const serialNumber = data[0] || "";
        const loid = data[1] || ""; // LOID字段
        const frame = data[2] || "0"; // 框号
        const slot = data[3] || "";
        const ponPort = data[4] || "";
        const deviceNum = data[5] || "";
        
        if (!serialNumber || !slot || !ponPort || !deviceNum) {
          showToast({
            message: `第${index + 1}行数据不完整，已跳过`,
            type: 'warning'
          });
          return;
        }
        
        // 检查是否需要更新VLAN值
        if (frame !== lastFrame || slot !== lastSlot || ponPort !== lastPort) {
          // 框号/槽位/PON口变化，更新VLAN值
          if (currentBizVlan < bizVlanEnd) {
            currentBizVlan++;
          } else {
            currentBizVlan = bizVlanStart; // 循环回到起始值
          }
          
          if (currentIptvVlan < iptvVlanEnd) {
            currentIptvVlan++;
          } else {
            currentIptvVlan = iptvVlanStart; // 循环回到起始值
          }
        }
        
        // 更新上一条记录的信息
        lastFrame = frame;
        lastSlot = slot;
        lastPort = ponPort;
        
        // 计算内部VLAN值
        const sum = Number.parseInt(deviceNum) + 1000;
        const sum1 = Number.parseInt(deviceNum) + 3500;
        
        generatedCommands += `# 设备 ${index + 1} 配置 (${serialNumber})\n`;
        
        // 根据LOID是否为空选择配置格式
        if (loid) {
          // 华为下发配置 - LOID不为空
          generatedCommands += `interface gpon 0/${slot}\n`;
          generatedCommands += `ont add ${ponPort} ${deviceNum} loid-auth ${loid} always-on omci ont-lineprofile-id 2 ont-srvprofile-id 0 desc ${loid}\n`;
          generatedCommands += `\n`;
          generatedCommands += `quit\n`;
          generatedCommands += `service-port vlan 8 gpon 0/${slot}/${ponPort} ont ${deviceNum} gemport 1 multi-service user-vlan 8 tag-transform translate\n`;
          generatedCommands += `\n`;
          generatedCommands += `service-port vlan ${currentBizVlan} gpon 0/${slot}/${ponPort} ont ${deviceNum} gemport 0 multi-service user-vlan untagged tag-transform add-double inner-vlan ${sum} inner-priority 0\n`;
          generatedCommands += `\n`;
          generatedCommands += `service-port vlan ${currentIptvVlan} gpon 0/${slot}/${ponPort} ont ${deviceNum} gemport 2 multi-service user-vlan 30 tag-transform translate-and-add inner-vlan ${sum1} inner-priority 0\n`;
        } else {
          // 华为手工配置 - LOID为空
          generatedCommands += `interface gpon 0/${slot}\n`;
          generatedCommands += `ont add ${ponPort} ${deviceNum} sn-auth ${serialNumber} omci ont-lineprofile-id 1000 ont-srvprofile-id 1000 desc ${serialNumber}\n`;
          generatedCommands += `\n`;
          generatedCommands += `ont port native-vlan ${ponPort} ${deviceNum} eth 1 vlan 101 priority 0\n`;
          generatedCommands += `\n`;
          generatedCommands += `ont port native-vlan ${ponPort} ${deviceNum} eth 2 vlan 102 priority 0\n`;
          generatedCommands += `\n`;
          generatedCommands += `quit\n`;
          generatedCommands += `service-port vlan ${currentBizVlan} gpon 0/${slot}/${ponPort} ont ${deviceNum} gemport 0 multi-service user-vlan 101 tag-transform translate-and-add inner-vlan ${sum} rx-cttr 6 tx-cttr 6\n`;
          generatedCommands += `service-port vlan ${currentIptvVlan} gpon 0/${slot}/${ponPort} ont ${deviceNum} multi-service user-vlan 102 tag-transform translate-and-add inner-vlan ${sum1} rx-cttr 6 tx-cttr 6\n`;
        }
        
        generatedCommands += `\n\n`;
      });
      
      setOutputCommands(generatedCommands);
      showToast({
        message: '批量命令已生成',
        type: 'success'
      });
    } catch (error) {
      console.error("生成命令错误:", error);
      showToast({
        message: '生成命令出错，请检查输入数据格式',
        type: 'error'
      });
    }
  };

  // 处理导入数据文件
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // 检查是否包含OLT自动发现数据的特征
      if (content.includes('display ont autofind') || content.includes('ONT SN')) {
        // 处理OLT自动发现数据
        extractDataFromAutofind(content);
      } else {
        // 普通数据直接显示
        setImportedData(content);
        showToast({
          message: '数据导入成功',
          type: 'success'
        });
      }
    };
    reader.onerror = () => {
      showToast({
        message: '文件读取失败',
        type: 'error'
      });
    };
    reader.readAsText(file);
  };

  // 从剪贴板粘贴数据
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        showToast({
          message: '剪贴板为空',
          type: 'warning'
        });
        return;
      }
      
      // 检查是否包含OLT自动发现数据的特征
      if (text.includes('display ont autofind') || text.includes('ONT SN')) {
        // 处理OLT自动发现数据
        extractDataFromAutofind(text);
      } else {
        // 普通数据直接显示
        setImportedData(text);
        showToast({
          message: '数据粘贴成功',
          type: 'success'
        });
      }
    } catch (error) {
      console.error("粘贴错误:", error);
      showToast({
        message: '从剪贴板粘贴失败',
        type: 'error'
      });
    }
  };

  // 复制命令到剪贴板
  const copyToClipboard = () => {
    if (!outputCommands) {
      showToast({
        message: '没有可复制的命令',
        type: 'error'
      });
      return;
    }
    
    navigator.clipboard.writeText(outputCommands)
      .then(() => showToast({
        message: '命令已复制到剪贴板',
        type: 'success'
      }))
      .catch(() => showToast({
        message: '复制失败，请手动复制',
        type: 'error'
      }));
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 overflow-auto p-4 bg-muted/30">
          <div className="container mx-auto py-6 space-y-8">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">批量数据下发</h1>
              <p className="text-muted-foreground">
                批量生成网络设备配置命令，提高工作效率
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 左侧输入面板 */}
              <div className="space-y-6">
                <Card style={gradientStyle} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <TerminalSquare className="h-5 w-5" />
                      配置参数
                    </CardTitle>
                    <CardDescription>
                      设置批量下发的参数信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bizVlanStart">业务VLAN起始</Label>
                          <Input
                            id="bizVlanStart"
                            name="bizVlanStart"
                            placeholder="例如: 100"
                            value={formData.bizVlanStart}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bizVlanEnd">业务VLAN结束</Label>
                          <Input
                            id="bizVlanEnd"
                            name="bizVlanEnd"
                            placeholder="例如: 199"
                            value={formData.bizVlanEnd}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="iptvVlanStart">IPTV VLAN起始</Label>
                          <Input
                            id="iptvVlanStart"
                            name="iptvVlanStart"
                            placeholder="例如: 200"
                            value={formData.iptvVlanStart}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="iptvVlanEnd">IPTV VLAN结束</Label>
                          <Input
                            id="iptvVlanEnd"
                            name="iptvVlanEnd"
                            placeholder="例如: 299"
                            value={formData.iptvVlanEnd}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        <p>注意: VLAN将在指定范围内循环分配给每个设备</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card style={gradientStyle} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <FileUp className="h-5 w-5" />
                      批量数据
                    </CardTitle>
                    <CardDescription>
                      导入或输入需要批量处理的数据
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".txt,.csv"
                        id="importFile"
                        className="hidden"
                        onChange={handleFileImport}
                      />
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => document.getElementById('importFile')?.click()}
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        导入数据文件
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={handlePasteFromClipboard}
                      >
                        <Scissors className="mr-2 h-4 w-4" />
                        从剪贴板粘贴
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="importedData">数据预览（每行一条记录，字段用逗号分隔）</Label>
                      <div className="text-xs text-muted-foreground mb-2">
                        格式: 序列号,LOID,框号,槽位,PON口,设备号
                      </div>
                      <Textarea
                        id="importedData"
                        className="min-h-[150px] font-mono text-sm"
                        placeholder="48575443EC5525AD,073400629575,0,1,14,1"
                        value={importedData}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportedData(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右侧输出面板 */}
              <div className="space-y-6">
                <Card style={gradientStyle} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      命令输出
                    </CardTitle>
                    <CardDescription>
                      生成的批量配置命令
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      className="min-h-[400px] font-mono text-sm"
                      placeholder={'点击"批量生成"按钮生成命令...'}
                      value={outputCommands}
                      readOnly
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      onClick={generateBatchCommands}
                      className="gap-2"
                    >
                      <ArrowDownToLine className="h-4 w-4" />
                      批量生成
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={copyToClipboard}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      复制命令
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
} 