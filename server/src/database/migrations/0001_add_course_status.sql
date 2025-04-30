-- 添加课程状态列
ALTER TABLE courses
ADD COLUMN status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' COMMENT '课程状态：draft-草稿，published-已发布，archived-已归档';

-- 更新现有数据，将所有现有课程设置为已发布状态
UPDATE courses SET status = 'published' WHERE status IS NULL; 