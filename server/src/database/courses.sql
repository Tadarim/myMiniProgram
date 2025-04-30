-- 课程表
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0,
    status ENUM(
        'draft',
        'published',
        'archived'
    ) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_num INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

-- 课程素材表
CREATE TABLE IF NOT EXISTS materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM(
        'video',
        'ppt',
        'pdf',
        'doc',
        'txt',
        'image',
        'audio'
    ) NOT NULL,
    url VARCHAR(255) NOT NULL,
    order_num INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, course_id)
);