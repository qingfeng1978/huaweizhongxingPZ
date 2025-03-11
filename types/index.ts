/**
 * 集中类型定义文件
 * 定义项目中所有共享的接口和类型
 */

/**
 * 表单数据接口
 */
export interface FormData {
  serial: string;
  slot: string;
  ponPort: string;
  deviceNum: string;
  bizVlan: string;
  iptvVlan: string;
  ipaddr: string;
  voiceipaddr: string;
  multicastVlan: string;
  isVoiceEnabled: boolean;
}

/**
 * 设备配置接口
 */
export interface DeviceConfig {
  id?: string;
  device_type: string;
  config_type?: string;
  serial: string;
  frame_no?: string;
  slot: string;
  pon_port: string;
  device_num: string;
  biz_vlan: string;
  iptv_vlan: string;
  ip_addr?: string;
  voice_ip_addr?: string;
  multicast_vlan?: string;
  has_voice: boolean;
  command_output: string;
  reason?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 选项类型
 * 用于下拉菜单或选择组件
 */
export interface Option {
  label: string;
  value: string;
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

/**
 * 配置类型枚举
 */
export enum ConfigType {
  HUAWEI = 'huawei',
  ZTE = 'zte'
}

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
} 