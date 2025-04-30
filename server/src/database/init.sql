-- 删除现有表
DROP TABLE IF EXISTS materials;

-- 创建材料表
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    order_num INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    is_system BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY (chapter_id) REFERENCES chapters (id)
);