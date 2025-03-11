-- 添加reason字段到device_configs表
ALTER TABLE device_configs 
ADD COLUMN IF NOT EXISTS reason TEXT;

-- 添加框号列，固定值为"0"
ALTER TABLE device_configs 
ADD COLUMN IF NOT EXISTS frame_no TEXT DEFAULT '0';

-- 更新表格上的评论
COMMENT ON COLUMN device_configs.reason IS '配置制作原因，可以是"下发失败"、"华为ONU"或"加装IPTV"';
COMMENT ON COLUMN device_configs.frame_no IS '框号，固定值为0';

-- 查看更新后的表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  col_description(('device_configs'::regclass)::oid, ordinal_position) as column_comment
FROM 
  information_schema.columns 
WHERE 
  table_name = 'device_configs'
ORDER BY ordinal_position; 