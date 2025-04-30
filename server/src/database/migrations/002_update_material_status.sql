-- 修改 materials 表的 status 字段
ALTER TABLE materials
MODIFY COLUMN status ENUM(
    'pending',
    'approved',
    'rejected'
) NOT NULL DEFAULT 'pending';

-- 更新现有数据
UPDATE materials
SET
    status = 'approved'
WHERE
    status = 'pending'
    OR status IS NULL;