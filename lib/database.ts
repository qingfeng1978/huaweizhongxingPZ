import { supabase } from './supabaseClient'
import { DeviceConfig } from '@/types'
import { logError } from './utils'
import { measureAsync } from './monitoring'

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
let configsCache: { data: DeviceConfig[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

// 数据验证
function validateConfig(config: DeviceConfig): boolean {
  if (!config.device_type || !config.serial) {
    throw new Error('设备类型和序列号为必填项');
  }
  return true;
}

// 添加配置数据到Supabase
export const addConfigToSupabase = measureAsync('addConfigToSupabase', async (config: DeviceConfig) => {
  validateConfig(config);
  
  const configWithFrameNo = {
    ...config,
    frame_no: '0'
  };

  const { data, error } = await supabase
    .from('device_configs')
    .insert([configWithFrameNo])
    .select()

  if (error) {
    logError('添加配置失败', error)
    throw error
  }

  // 清除缓存
  configsCache.data = null;
  return data
});

// 批量添加配置数据
export const batchAddConfigs = measureAsync('batchAddConfigs', async (configs: DeviceConfig[]) => {
  configs.forEach(validateConfig);
  
  const configsWithFrameNo = configs.map(config => ({
    ...config,
    frame_no: '0'
  }));

  const { data, error } = await supabase
    .from('device_configs')
    .insert(configsWithFrameNo)
    .select()

  if (error) {
    logError('批量添加配置失败', error)
    throw error
  }

  // 清除缓存
  configsCache.data = null;
  return data
});

// 获取所有配置数据（带缓存）
export const getAllConfigs = measureAsync('getAllConfigs', async () => {
  // 检查缓存是否有效
  const now = Date.now();
  if (configsCache.data && (now - configsCache.timestamp) < CACHE_DURATION) {
    return configsCache.data;
  }

  const { data, error } = await supabase
    .from('device_configs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    logError('获取配置列表失败', error)
    throw error
  }

  // 更新缓存
  configsCache = {
    data,
    timestamp: now
  };

  return data
});

// 按条件查询配置数据
export const queryConfigs = measureAsync('queryConfigs', async (query: {
  device_type?: string;
  serial_number?: string;
  created_at_start?: string;
  created_at_end?: string;
}) => {
  let queryBuilder = supabase
    .from('device_configs')
    .select('*')
    
  if (query.device_type) {
    queryBuilder = queryBuilder.eq('device_type', query.device_type)
  }
  if (query.serial_number) {
    queryBuilder = queryBuilder.eq('serial_number', query.serial_number)
  }
  if (query.created_at_start) {
    queryBuilder = queryBuilder.gte('created_at', query.created_at_start)
  }
  if (query.created_at_end) {
    queryBuilder = queryBuilder.lte('created_at', query.created_at_end)
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false })

  if (error) {
    logError('查询配置失败', error)
    throw error
  }

  return data
});

// 删除配置数据
export const deleteConfig = measureAsync('deleteConfig', async (id: string) => {
  const { error } = await supabase
    .from('device_configs')
    .delete()
    .eq('id', id)

  if (error) {
    logError('删除配置失败', error)
    throw error
  }

  // 清除缓存
  configsCache.data = null;
  return true
});

// 批量删除配置数据
export const batchDeleteConfigs = measureAsync('batchDeleteConfigs', async (ids: string[]) => {
  const { error } = await supabase
    .from('device_configs')
    .delete()
    .in('id', ids)

  if (error) {
    logError('批量删除配置失败', error)
    throw error
  }

  // 清除缓存
  configsCache.data = null;
  return true
});

// 更新配置数据
export const updateConfig = measureAsync('updateConfig', async (id: string, config: Partial<DeviceConfig>) => {
  const { data, error } = await supabase
    .from('device_configs')
    .update(config)
    .eq('id', id)
    .select()

  if (error) {
    logError('更新配置失败', error)
    throw error
  }

  // 清除缓存
  configsCache.data = null;
  return data
}); 