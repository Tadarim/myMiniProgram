-- 修改 materials 表中 url 字段的长度
ALTER TABLE materials MODIFY COLUMN url VARCHAR(1000); 