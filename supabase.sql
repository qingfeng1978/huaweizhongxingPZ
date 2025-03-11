-- 创建设备配置表
CREATE TABLE IF NOT EXISTS device_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_type TEXT NOT NULL CHECK (device_type IN ('huawei', 'zte')),
  serial TEXT NOT NULL,
  slot TEXT NOT NULL,
  pon_port TEXT NOT NULL,
  device_num TEXT NOT NULL,
  biz_vlan TEXT NOT NULL,
  iptv_vlan TEXT NOT NULL,
  ip_addr TEXT,
  voice_ip_addr TEXT,
  multicast_vlan TEXT,
  has_voice BOOLEAN DEFAULT FALSE,
  command_output TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 启用行级安全策略
  CONSTRAINT valid_ip_addr CHECK (
    ip_addr IS NULL OR 
    ip_addr LIKE '192.168.77.%' OR 
    ip_addr LIKE '10.155.%'
  ),
  CONSTRAINT valid_voice_ip_addr CHECK (
    voice_ip_addr IS NULL OR 
    voice_ip_addr LIKE '10.251.%' OR 
    voice_ip_addr LIKE '10.66.%'
  )
);

-- 启用RLS (Row Level Security)
ALTER TABLE device_configs ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户查看、添加和删除数据
CREATE POLICY "Allow anonymous read access" 
  ON device_configs FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" 
  ON device_configs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access" 
  ON device_configs FOR DELETE USING (true);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS device_configs_device_type_idx ON device_configs (device_type);
CREATE INDEX IF NOT EXISTS device_configs_created_at_idx ON device_configs (created_at DESC); 