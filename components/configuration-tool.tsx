"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"
import { DataViewer } from "@/components/data-viewer"
import { addConfigToSupabase, getAllConfigs } from "@/lib/database"
import { storage } from "@/lib/storage"
import { handleError, logError } from "@/lib/utils"
import { FormData, DeviceConfig } from "@/types"
import { useFormValidation } from "@/hooks/useFormValidation"
import { useAppUtils } from "@/hooks/useAppUtils"
import { useToast } from "./ui/toast-message"

export function ConfigurationTool() {
  // Initialize with Huawei selected by default
  const [selectedConfigs, setSelectedConfigs] = useState<string[]>(["huawei"])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOutput, setCommandOutput] = useState("")
  const [showDataViewer, setShowDataViewer] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string>("下发失败")
  
  // 使用自定义Hook处理表单
  const initialFormData: FormData = {
    serial: "",
    slot: "",
    ponPort: "",
    deviceNum: "",
    bizVlan: "",
    iptvVlan: "",
    ipaddr: "",
    voiceipaddr: "",
    multicastVlan: "",
    isVoiceEnabled: false
  };
  
  // 初始化ref来追踪组件是否已经初始化
  const isInitializedRef = useRef(false);
  
  const { formData, updateFormData, resetForm: resetFormData } = useFormValidation({
    initialData: initialFormData
  });
  
  // 使用应用工具Hook
  const { copyTextWithFeedback } = useAppUtils();
  
  // 使用Toast消息
  const { showToast } = useToast();

  // 重置所有输入框和输出框，但保持下拉选择框不变
  const resetForm = () => {
    resetFormData();
    setCommandOutput("");
    // 重置设备类型选择为默认值"huawei"
    setSelectedConfigs(["huawei"]);
  }

  // 批量更新表单数据的函数
  const updateFormDataBatch = (updates: Partial<FormData>) => {
    Object.entries(updates).forEach(([key, value]) => {
      updateFormData(key as keyof FormData, value as string | boolean);
    });
  };

  // 使用单个useEffect进行所有初始化操作
  useEffect(() => {
    // 如果已经初始化过，直接返回
    if (isInitializedRef.current) return;
    
    // 标记为已初始化，避免重复执行
    isInitializedRef.current = true;
    
    // 1. 首先重置表单
    resetForm();
    
    // 2. 读取保存的模式设置
    const savedMode = storage.get('selectedMode', '');
    if (savedMode && savedMode.length > 0) {
      setSelectedMode(savedMode);
    }
    
    // 3. 检查是否有要加载的配置
    const loadedConfig = storage.get('loadedConfig');
    if (loadedConfig) {
      try {
        // 清除本地存储，防止页面刷新时重新加载
        storage.remove('loadedConfig');
        
        // 设置设备类型
        setSelectedConfigs(_prev => {
          // 创建新的配置列表，清除语音配置
          const newConfigs = [];
          // 保留voice配置如果需要
          if (loadedConfig.has_voice) {
            newConfigs.push('voice');
          }
          // 添加设备类型
          newConfigs.push(loadedConfig.device_type);
          return newConfigs;
        });
        
        // 批量更新所有表单字段
        updateFormDataBatch({
          serial: loadedConfig.serial || "",
          slot: loadedConfig.slot || "",
          ponPort: loadedConfig.pon_port || "",
          deviceNum: loadedConfig.device_num || "",
          bizVlan: loadedConfig.biz_vlan || "",
          iptvVlan: loadedConfig.iptv_vlan || "",
          ipaddr: loadedConfig.ip_addr || "",
          voiceipaddr: loadedConfig.voice_ip_addr || "",
          multicastVlan: loadedConfig.multicast_vlan || "",
          isVoiceEnabled: loadedConfig.has_voice
        });
        
        // 设置命令输出
        if (loadedConfig.command_output) {
          setCommandOutput(loadedConfig.command_output);
        }
        
        // 设置模式（如果有）
        if (loadedConfig.reason) {
          setSelectedMode(loadedConfig.reason);
          storage.set('selectedMode', loadedConfig.reason);
        }
        
        showToast({
          message: '配置加载成功',
          type: 'success'
        });
      } catch (error) {
        logError('加载配置失败', error);
        showToast({
          message: '加载配置失败',
          type: 'error'
        });
      }
    }
  // 只在组件挂载时执行一次
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleConfig = (config: string) => {
    // For Huawei and ZTE, we implement exclusive selection
    if (config === "huawei" || config === "zte") {
      if (selectedConfigs.includes(config)) {
        // If already selected, do nothing (prevent deselection)
        return
      } else {
        // Remove both Huawei and ZTE, then add the selected one
        const newConfigs = selectedConfigs.filter((c) => c !== "huawei" && c !== "zte")
        setSelectedConfigs([...newConfigs, config])
      }
    } else {
      // For other configs like "voice", toggle as usual
      if (selectedConfigs.includes(config)) {
        setSelectedConfigs(selectedConfigs.filter((item) => item !== config))
      } else {
        setSelectedConfigs([...selectedConfigs, config])
      }
    }
  }

  // 配置生成函数
  const generateCommand = (activeTab: string) => {
    // 验证是否选择了指定的数据制作原因
    const validReasons = ["下发失败", "华为ONU", "加装IPTV"];
    if (!selectedMode || !validReasons.includes(selectedMode)) {
      showToast({
        message: '请选择数据制作原因（下发失败、华为ONU或加装IPTV）',
        type: 'warning'
      });
      return;
    }

    // 华为组播配置特殊处理
    if (activeTab === "huawei-multicast") {
      if (!formData.multicastVlan) {
        showToast({
          message: '请输入组播VLAN',
          type: 'warning'
        });
        return;
      }
    } else {
      // 基本字段验证（除华为组播配置外的所有配置都需要）
      if (!formData.serial) {
        showToast({
          message: '请输入序列号',
          type: 'warning'
        });
        return;
      }
      if (!formData.slot) {
        showToast({
          message: '请输入槽位号',
          type: 'warning'
        });
        return;
      }
      if (!formData.ponPort) {
        showToast({
          message: '请输入PON口',
          type: 'warning'
        });
        return;
      }
      if (!formData.deviceNum) {
        showToast({
          message: '请输入设备号',
          type: 'warning'
        });
        return;
      }
    }

    // 根据不同配置类型进行特定验证
    if (selectedConfigs.includes("huawei")) {
      switch (activeTab) {
        case "huawei-deploy":
        case "huawei-manual":
          if (!formData.bizVlan) {
            showToast({
              message: '请输入业务VLAN',
              type: 'warning'
            });
            return;
          }
          if (!formData.iptvVlan) {
            showToast({
              message: '请输入IPTV VLAN',
              type: 'warning'
            });
            return;
          }
          break;

        case "huawei-onu":
          if (!formData.ipaddr) {
            showToast({
              message: '请输入IP地址',
              type: 'warning'
            });
            return;
          }
          // IP地址格式验证
          if (!formData.ipaddr.startsWith("192.168.77.") && !formData.ipaddr.startsWith("10.155.")) {
            showToast({
              message: '请输入正确格式的IP地址（192.168.77.x 或 10.155.x.x）',
              type: 'warning'
            });
            return;
          }
          if (selectedConfigs.includes("voice")) {
            if (!formData.voiceipaddr) {
              showToast({
                message: '请输入语音IP地址',
                type: 'warning'
              });
              return;
            }
            // 语音IP地址格式验证
            if (!formData.voiceipaddr.startsWith("10.251.") && !formData.voiceipaddr.startsWith("10.66.")) {
              showToast({
                message: '请输入正确格式的语音IP地址（10.251.x.x 或 10.66.x.x）',
                type: 'warning'
              });
              return;
            }
          }
          break;
      }
    }

    if (selectedConfigs.includes("zte")) {
      switch (activeTab) {
        case "zte-c300":
          if (!formData.bizVlan) {
            showToast({
              message: '请输入业务VLAN',
              type: 'warning'
            });
            return;
          }
          if (!formData.iptvVlan) {
            showToast({
              message: '请输入IPTV VLAN',
              type: 'warning'
            });
            return;
          }
          break;

        case "zte-c600-manual":
          if (!formData.bizVlan) {
            showToast({
              message: '请输入业务VLAN',
              type: 'warning'
            });
            return;
          }
          if (!formData.iptvVlan) {
            showToast({
              message: '请输入IPTV VLAN',
              type: 'warning'
            });
            return;
          }
          break;

        case "zte-c600-deploy":
          if (!formData.bizVlan) {
            showToast({
              message: '请输入业务VLAN',
              type: 'warning'
            });
            return;
          }
          if (!formData.iptvVlan) {
            showToast({
              message: '请输入IPTV VLAN',
              type: 'warning'
            });
            return;
          }
          break;
      }
    }

    // 序列号格式验证
    if (activeTab === "huawei-deploy" || activeTab === "zte-c600-deploy") {
      // 验证0734开头的12位纯数字，或0734开头的12位纯数字+@swzx
      const serialPattern = /^0734\d{8}(@swzx)?$/;
      if (!serialPattern.test(formData.serial)) {
        showToast({
          message: '请输入正确的账号',
          type: 'warning'
        });
        return;
      }
    } else if (activeTab === "huawei-manual" || activeTab === "zte-c300" || activeTab === "zte-c600-manual") {
      // 验证16位字符
      if (formData.serial.length !== 16) {
        showToast({
          message: '请输入正确的序列号',
          type: 'warning'
        });
        return;
      }
    }

    const sum = Number.parseInt(formData.deviceNum) + 1000
    const sum1 = Number.parseInt(formData.deviceNum) + 3500
    let commands: string[] = []

    // 华为配置相关
    if (selectedConfigs.includes("huawei")) {
      switch (activeTab) {
        case "huawei-deploy":
          // 华为下发配置
          commands = [
            `interface gpon 0/${formData.slot}`,
            `ont add ${formData.ponPort} ${formData.deviceNum} loid-auth ${formData.serial} always-on omci ont-lineprofile-id 2 ont-srvprofile-id 0 desc ${formData.serial}\n`,
            `quit`,
            `service-port vlan 8 gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 1 multi-service user-vlan 8 tag-transform translate\n`,
            `service-port vlan ${formData.bizVlan} gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 0 multi-service user-vlan untagged tag-transform add-double inner-vlan ${sum} inner-priority 0\n`,
            `service-port vlan ${formData.iptvVlan} gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 2 multi-service user-vlan 30 tag-transform translate-and-add inner-vlan ${sum1} inner-priority 0\n`,
            `service-port vlan ${formData.iptvVlan} gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 2 multi-service user-vlan 30 tag-transform translate-and-add inner-vlan ${sum1} inner-priority 0\n`,
          ]

          // 添加语音配置
          if (selectedConfigs.includes("voice")) {
            commands.push(
              `service-port vlan 101 gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 3 multi-service user-vlan 100 tag-transform translate`,
            )
          }
          break;

        case "huawei-manual":
          // 华为手工配置
          commands = [
            `interface gpon 0/${formData.slot}`,
            `ont add ${formData.ponPort} ${formData.deviceNum} sn-auth ${formData.serial} omci ont-lineprofile-id 1000 ont-srvprofile-id 1000 desc ${formData.serial}\n`,
            `ont port native-vlan ${formData.ponPort} ${formData.deviceNum} eth 1 vlan 101 priority 0\n`,
            `ont port native-vlan ${formData.ponPort} ${formData.deviceNum} eth 2 vlan 102 priority 0\n`,
            `quit`,
            `service-port vlan ${formData.bizVlan} gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 0 multi-service user-vlan 101 tag-transform translate-and-add inner-vlan ${sum} rx-cttr 6 tx-cttr 6`,
            `service-port vlan ${formData.iptvVlan} gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 0 multi-service user-vlan 102 tag-transform translate-and-add inner-vlan ${sum1} rx-cttr 6 tx-cttr 6`,
            `service-port vlan ${formData.iptvVlan} gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 0 multi-service user-vlan 102 tag-transform translate-and-add inner-vlan ${sum1} rx-cttr 6 tx-cttr 6`,
          ]

          // 添加语音配置
          if (selectedConfigs.includes("voice")) {
            commands.push(
              `service-port vlan 101 gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 0 multi-service user-vlan 100 tag-transform translate`,
            )
          }
          break;

        case "huawei-onu":
          // 华为ONU配置
          let gateway = ""
          let vlan = ""

          // IP地址和网关配置
          if (formData.ipaddr.startsWith("192.168.77.")) {
            gateway = "192.168.77.1"
            vlan = "vlan 77"
          } else if (formData.ipaddr.startsWith("10.155.")) {
            const thirdOctet = formData.ipaddr.split(".")[2]
            gateway = `10.155.${thirdOctet}.1`
            vlan = "vlan 99"
          }

          commands = [
            "===== 华为ONU配置（OLT端） =====",
            `interface gpon 0/${formData.slot}`,
            `ont confirm ${formData.ponPort} sn-auth ${formData.serial} snmp ont-lineprofile-id 2016\n`,
            `ont ipconfig ${formData.ponPort} ${formData.deviceNum} static ip-address ${formData.ipaddr} mask 255.255.255.0 ${vlan} priority 0 gateway ${gateway}\n`,
            "quit",
            `service-port ${vlan} gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 0 multi-service user-${vlan} tag-transform translate\n`,
          ]

          // 添加语音service-port配置
          if (selectedConfigs.includes("voice")) {
            commands.push(
              `service-port vlan 101 gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 0 multi-service user-vlan 101 tag-transform translate\n`
            )
          }

          // 生成24个端口的配置
          for (let i = 0; i < 24; i++) {
            const gemport = i + 1
            const userVlan = 2001 + i
            const innerVlan = sum + i
            commands.push(
              `service-port vlan ${formData.bizVlan} gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport ${gemport} multi-service user-vlan ${userVlan} tag-transform translate-and-add inner-vlan ${innerVlan} rx-cttr 6 tx-cttr 6`,
            )
          }

          // ONU端配置
          commands = commands.concat([
            "\n===== 华为ONU配置（ONU端） =====",
            "vlan 2001 to 2024 mux",
            "y\n",
            "port vlan 2001 to 2024 0/0 1",
            "y\n",
          ])

          // 生成24个端口的service-port配置
          for (let i = 0; i < 24; i++) {
            const gemport = i + 1
            const userVlan = 2001 + i
            commands.push(
              `service-port vlan ${userVlan} eth 0/1/${gemport} multi-service user-vlan untagged rx-cttr 6 tx-cttr 6`
            )
          }

          commands.push("save")

          // 添加语音配置
          if (selectedConfigs.includes("voice")) {
            if (formData.voiceipaddr?.startsWith("10.251.") || formData.voiceipaddr?.startsWith("10.66.")) {
              const thirdOctet = formData.voiceipaddr.split(".")[2]
              const gateway1 = formData.voiceipaddr.startsWith("10.251.") ? 
                `10.251.${thirdOctet}.1` : 
                `10.66.${thirdOctet}.1`

              const voiceConfig = [
                "\n===== 语音配置 =====\n",
                "vlan 101 smart\n",
                "port vlan 101 0/0 1\n",
                "interface vlanif 101\n",
                `ip address ${formData.voiceipaddr} 255.255.255.0\n`,
                "quit\n",
                `ip route-static 10.249.0.0 255.255.0.0 ${gateway1}\n`,
                `ip route-static 10.251.0.0 255.255.0.0 ${gateway1}\n`,
                "voip\n",
                `ip address media ${formData.voiceipaddr} ${gateway1}\n`,
                `ip address signaling ${formData.voiceipaddr}\n`,
                "quit\n",
                "interface h248 0\n",
                "y\n",
                "digitmap-timer long 10\n",
                `if-h248 attribute mgip ${formData.voiceipaddr} mgport 2944 transfer udp\n`,
                "if-h248 attribute primary-mgc-ip1 10.249.0.184 primary-mgc-port 2944\n",
                "if-h248 attribute secondary-mgc-ip1 10.249.1.184 secondary-mgc-port 2944\n",
                `if-h248 attribute mg-media-ip1 ${formData.voiceipaddr}\n`,
                "mg-ringmode add 0 10 26\n",
                "mg-software parameter 13 1\n",
                "reset coldstart\n",
                "y\n",
                "quit\n",
                "esl user\n",
                "mgpstnuser batadd 0/2/1 0/2/24 0 terminalid 1\n",
                "quit\n",
                "save\n",
              ]
              commands = commands.concat(voiceConfig)
            } else if (formData.ipaddr.startsWith("192.168.77.")) {
              commands.push(
                `service-port vlan 101 gpon 0/${formData.slot}/${formData.ponPort} ont ${formData.deviceNum} gemport 0 multi-service user-vlan 100 tag-transform translate`,
              )
            }
          }
          break;

        case "huawei-multicast":
          // 华为组播配置
          commands = [
            "btv",
            `igmp user add service-port ${formData.multicastVlan}\n`,
            "multicast-vlan 55\n",
            `igmp multicast-vlan member service-port ${formData.multicastVlan}`,
            "quit",
            "quit",
            "quit",
            "y",
          ]
          break;
      }
    }

    // 中兴配置相关
    if (selectedConfigs.includes("zte")) {
      switch (activeTab) {
        case "zte-c300":
          // 中兴C300配置
          commands = [
            `interface gpon-olt_1/${formData.slot}/${formData.ponPort}`,
            `onu ${formData.deviceNum} type FTTH_G_HGU sn ${formData.serial}`,
            "exit",
            `interface gpon-onu_1/${formData.slot}/${formData.ponPort}:${formData.deviceNum}`,
            "tcont 2 profile default1",
            "gemport 1 name ge tcont 2",
            `service-port 1 vport 1 user-vlan 101 vlan ${sum} svlan ${formData.bizVlan}`,
            `service-port 2 vport 1 user-vlan 30 vlan ${sum1} svlan ${formData.iptvVlan}`,
          ]
          
          // 添加语音配置
          if (selectedConfigs.includes("voice")) {
            commands.push("service-port 6 vport 1 user-vlan 100 vlan 101")
          }

          commands = commands.concat([
            "exit",
            `pon-onu-mng gpon-onu_1/${formData.slot}/${formData.ponPort}:${formData.deviceNum}`,
            "service 1 gemport 1",
            "vlan port eth_0/1 mode tag vlan 101",
            "vlan port eth_0/2 mode tag vlan 30",
            "exit",
          ])
          break;

        case "zte-c600-manual":
          // 中兴C600手工配置
          commands = [
            `interface gpon_olt-1/${formData.slot}/${formData.ponPort}`,
            `onu ${formData.deviceNum} type FTTH_G_HGU sn ${formData.serial}`,
            "exit",
            `interface gpon_onu-1/${formData.slot}/${formData.ponPort}:${formData.deviceNum}`,
            "tcont 1 profile default1",
            "gemport 1 name ge tcont 1",
            "exit",
            `interface vport-1/${formData.slot}/${formData.ponPort}.${formData.deviceNum}:1`,
            `service-port 1 user-vlan 101 vlan ${sum} svlan ${formData.bizVlan}`,
            `service-port 2 user-vlan 30 vlan ${sum1} svlan ${formData.iptvVlan}`,
          ]

          // 添加语音配置
          if (selectedConfigs.includes("voice")) {
            commands.push("service-port 6 vport 1 user-vlan 100 vlan 101")
          }

          commands = commands.concat([
            "exit",
            `pon-onu-mng gpon_onu-1/${formData.slot}/${formData.ponPort}:${formData.deviceNum}`,
            "service 1 gemport 1",
            "vlan port eth_0/1 mode tag vlan 101",
            "vlan port eth_0/2 mode tag vlan 30",
            "exit",
          ])
          break;

        case "zte-c600-deploy":
          // 中兴C600下发配置
          commands = [
            `interface gpon_olt-1/${formData.slot}/${formData.ponPort}`,
            `onu ${formData.deviceNum} type FTTH_G_HGU loid ${formData.serial}`,
            "exit",
            `interface gpon_onu-1/${formData.slot}/${formData.ponPort}:${formData.deviceNum}`,
            "tcont 1 name Tl1DefaultCreate profile default1",
            "sn-bind disable",
            "gemport 1 name Tl1DefaultCreate tcont 1",
            "exit",
            `interface vport-1/${formData.slot}/${formData.ponPort}.${formData.deviceNum}:1`,
            `service-port 1 user-vlan untagged vlan ${sum} svlan ${formData.bizVlan}`,
            "service-port 1 description Tl1OpVlanUntag",
            "service-port 2 user-vlan 8 vlan 8",
            "service-port 2 description Tl1OpVlan8",
            `service-port 3 user-vlan 30 vlan ${sum1} svlan ${formData.iptvVlan}`,
            "service-port 3 description Tl1OpVlan30",
          ]

          // 添加语音配置
          if (selectedConfigs.includes("voice")) {
            commands.push("service-port 6 vport 1 user-vlan 100 vlan 101")
          }

          commands = commands.concat([
            "exit",
            `pon-onu-mng gpon_onu-1/${formData.slot}/${formData.ponPort}:${formData.deviceNum}`,
            "mvlan 55",
            "service Tl1DefaultCreate gemport 1",
            "exit",
          ])
          break;
      }
    }

    // 在命令末尾添加两个换行符
    const commandWithNewlines = commands.join("\n") + "\n\n";
    
    // 设置命令输出
    setCommandOutput(commandWithNewlines);
    
    // 复制到剪贴板
    try {
      copyTextWithFeedback(commandWithNewlines, 
        (originalText) => {
          // 成功回调
          setCommandOutput(originalText + "\n\n【已复制到剪贴板】");
          setTimeout(() => {
            setCommandOutput(originalText);
          }, 1500);
        },
        () => {
          // 失败回调
          showToast({
            message: '复制到剪贴板失败',
            type: 'error'
          });
        }
      );
    } catch (error) {
      logError('剪贴板操作不支持', error);
    }
  }

  const addData = async () => {
    if (!commandOutput) {
      showToast({
        message: '请先生成配置命令',
        type: 'warning'
      });
      return;
    }

    // 判断是否选择了指定的数据制作原因
    const validReasons = ["下发失败", "华为ONU", "加装IPTV"];
    if (!selectedMode || !validReasons.includes(selectedMode)) {
      showToast({
        message: '请选择数据制作原因（下发失败、华为ONU或加装IPTV）',
        type: 'warning'
      });
      return;
    }

    try {
      // 创建要保存的配置对象
      const deviceType = selectedConfigs.includes('huawei') ? 'huawei' : 'zte'
      
      const configToSave: DeviceConfig = {
        device_type: deviceType,
        serial: formData.serial,
        frame_no: '0',  // 添加框号，固定为"0"
        slot: formData.slot,
        pon_port: formData.ponPort,
        device_num: formData.deviceNum,
        biz_vlan: formData.bizVlan,
        iptv_vlan: formData.iptvVlan,
        ip_addr: formData.ipaddr || undefined,
        voice_ip_addr: formData.voiceipaddr || undefined,
        multicast_vlan: formData.multicastVlan || undefined,
        has_voice: selectedConfigs.includes('voice'),
        command_output: commandOutput,
        reason: selectedMode // 添加数据制作原因
      }

      // 保存到Supabase
      await addConfigToSupabase(configToSave)
      showToast({
        message: '配置保存成功',
        type: 'success'
      });
      // 不再显示提示框，直接清空表单和输出框
      resetForm()
    } catch (error) {
      await handleError('保存配置到数据库失败', error)
    }
  }

  const exportData = async () => {
    try {
      // 从数据库获取所有配置数据
      const configs = await getAllConfigs();
      
      if (configs.length === 0) {
        showToast({
          message: '暂无数据可导出',
          type: 'warning'
        });
        return;
      }
      
      // 格式化数据为CSV格式
      let csvContent = "设备类型,序列号,框号,槽位,PON口,设备号,业务VLAN,IPTV VLAN,IP地址,语音IP地址,组播VLAN,语音开启,创建时间,原因\n";
      
      configs.forEach(config => {
        const deviceType = config.device_type === 'huawei' ? '华为OLT' : '中兴OLT';
        const date = new Date(config.created_at || '').toISOString().split('T')[0];
        
        csvContent += `${deviceType},${config.serial},${config.frame_no || '0'},${config.slot},${config.pon_port},${config.device_num},${config.biz_vlan},${config.iptv_vlan},${config.ip_addr || ''},${config.voice_ip_addr || ''},${config.multicast_vlan || ''},${config.has_voice ? '是' : '否'},${date},${config.reason || ''}\n`;
      });
      
      // 创建Blob对象
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const link = document.createElement("a");
      const fileName = `配置数据_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 显示导出成功提示
      showToast({
        message: '导出数据成功',
        type: 'success'
      });
    } catch (error) {
      await handleError('导出数据失败', error);
    }
  }

  const handleFormChange = (field: keyof FormData, value: string | boolean) => {
    updateFormData(field, value);
  }

  const handleLoadConfig = (config: DeviceConfig) => {
    // 设置设备类型
    const newConfigs = ['voice'].filter(item => selectedConfigs.includes(item))
    if (config.has_voice) {
      newConfigs.push('voice')
    }
    newConfigs.push(config.device_type)
    setSelectedConfigs(newConfigs)
    
    // 设置表单数据
    updateFormData('serial', config.serial || "");
    updateFormData('slot', config.slot || "");
    updateFormData('ponPort', config.pon_port || "");
    updateFormData('deviceNum', config.device_num || "");
    updateFormData('bizVlan', config.biz_vlan || "");
    updateFormData('iptvVlan', config.iptv_vlan || "");
    updateFormData('ipaddr', config.ip_addr || "");
    updateFormData('voiceipaddr', config.voice_ip_addr || "");
    updateFormData('multicastVlan', config.multicast_vlan || "");
    updateFormData('isVoiceEnabled', config.has_voice);
    
    // 设置命令输出
    setCommandOutput(config.command_output || "")

    // 设置数据原因
    if (config.reason) {
      setSelectedMode(config.reason)
      // 同时更新storage中的值
      storage.set('selectedMode', config.reason)
    }
  }

  // 处理模式选择
  const handleModeSelection = (mode: string) => {
    setSelectedMode(mode)
    // 保存选择的模式到storage
    storage.set('selectedMode', mode)
  }
  
  // 处理命令输出变更
  const handleCommandOutputChange = (value: string) => {
    setCommandOutput(value);
  }
  
  // 添加查看数据查看器的处理函数
  const handleViewDataClick = () => {
    setShowDataViewer(true);
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedConfigs={selectedConfigs}
          toggleConfig={toggleConfig}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          selectedMode={selectedMode}
          onModeSelect={handleModeSelection}
        />
        {showDataViewer ? (
          <DataViewer 
            onClose={() => setShowDataViewer(false)} 
            onConfigLoad={handleLoadConfig}
          />
        ) : (
          <MainContent
            selectedConfigs={selectedConfigs}
            commandOutput={commandOutput}
            generateCommand={generateCommand}
            addData={addData}
            exportData={exportData}
            formData={formData}
            onFormChange={handleFormChange}
            onViewData={handleViewDataClick}
            onCommandOutputChange={handleCommandOutputChange}
          />
        )}
      </div>
    </div>
  )
}

