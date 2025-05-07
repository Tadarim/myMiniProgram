-- 创建数据库
CREATE DATABASE IF NOT EXISTS learning_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE learning_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    avatar VARCHAR(255),
    background_image VARCHAR(255),
    description TEXT,
    extra JSON,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 学习档案表
CREATE TABLE IF NOT EXISTS learning_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    learning_style VARCHAR(50),
    learning_goals TEXT,
    learning_history JSON,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0.0,
    view_count INT NOT NULL DEFAULT 0,
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

-- 素材表
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
    status ENUM(
        'pending',
        'approved',
        'rejected',
        'active'
    ) DEFAULT 'active',
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_id INT NOT NULL,
    target_type ENUM('course', 'material') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (
        user_id,
        target_id,
        target_type
    )
);

-- 日程表
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 习题集表
CREATE TABLE IF NOT EXISTS exercise_sets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question_count INT NOT NULL DEFAULT 0,
    complete_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 习题题目表
CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_set_id INT NOT NULL,
    content TEXT NOT NULL,
    type ENUM('single', 'multiple') NOT NULL,
    options JSON NOT NULL,
    answer JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_set_id) REFERENCES exercise_sets (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercise_completions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_set_id INT NOT NULL,
    user_id INT NOT NULL,
    completed_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_set_id) REFERENCES exercise_sets (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 添加索引
CREATE INDEX idx_exercise_completions_exercise_set_id ON exercise_completions (exercise_set_id);

CREATE INDEX idx_exercise_completions_user_id ON exercise_completions (user_id);

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    attachments JSON,
    type ENUM('normal', 'help') NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 帖子标签关联表
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

-- 帖子点赞表
CREATE TABLE IF NOT EXISTS post_likes (
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 帖子收藏表
CREATE TABLE IF NOT EXISTS post_collections (
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 评论点赞表
CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 添加索引
CREATE INDEX idx_posts_author_id ON posts (author_id);
CREATE INDEX idx_posts_created_at ON posts (created_at);
CREATE INDEX idx_comments_post_id ON comments (post_id);
CREATE INDEX idx_comments_user_id ON comments (user_id);

-- 插入用户数据
INSERT INTO
    users (
        username,
        email,
        password,
        avatar,
        background_image,
        description,
        extra
    )
VALUES (
        '张三',
        'zhangsan@example.com',
        '$2b$10$Uw.E1RhuxdkWtNeE3tJC8uJ8gIF/4LsBY0mnkwIgslcDodK0tna.i',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '热爱学习的学生',
        '{"gender": 1, "location": ["北京", "市辖区"], "school": "北京大学", "birthday": "2000-01-01", "age": 24, "constellation": "摩羯座", "createTime": "2024-01-01 10:00:00", "lastLoginTime": "2024-03-20 15:30:00"}'
    ),
    (
        '李四',
        'lisi@example.com',
        '$2b$10$ZcswQUykLVNZiRmwjg4hDOCXr.aF.fltqTqYIiXNjwDmImJ03tNM.',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '计算机科学爱好者',
        '{"gender": 1, "location": ["上海", "市辖区"], "school": "复旦大学", "birthday": "2001-02-02", "age": 23, "constellation": "水瓶座", "createTime": "2024-01-02 11:00:00", "lastLoginTime": "2024-03-19 16:30:00"}'
    ),
    (
        '王五',
        'wangwu@example.com',
        '$2b$10$tF91Ntj63QeMB6wkapc98ORNCfXfBUPE5v94yfmC5WrVK2erDpIt2',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '数学爱好者',
        '{"gender": 1, "location": ["广东", "广州"], "school": "中山大学", "birthday": "1999-03-03", "age": 25, "constellation": "双鱼座", "createTime": "2024-01-03 12:00:00", "lastLoginTime": "2024-03-18 17:30:00"}'
    );

-- 插入学习档案数据
INSERT INTO
    learning_profiles (
        user_id,
        learning_style,
        learning_goals,
        learning_history
    )
VALUES (
        1,
        '视觉型',
        '掌握Python编程',
        '{"completed_courses": ["Python基础", "数据结构"], "current_courses": ["机器学习"], "achievements": ["Python初级认证"]}'
    ),
    (
        2,
        '听觉型',
        '学习人工智能',
        '{"completed_courses": ["机器学习基础", "深度学习"], "current_courses": ["自然语言处理"], "achievements": ["AI初级认证"]}'
    ),
    (
        3,
        '动手型',
        '精通数学建模',
        '{"completed_courses": ["高等数学", "线性代数"], "current_courses": ["数学建模"], "achievements": ["数学竞赛一等奖"]}'
    );

-- 插入管理员数据
INSERT INTO
    admins (
        username,
        password,
        name,
        role
    )
VALUES (
        'admin',
        '$2b$10$YiigDBw3kTLaQxl6Na2WTOhbf8JpZQwzWVw5XyFjzepN9oorhMRCq',
        '普通管理员',
        'admin'
    ),
    (
        'superadmin',
        '$2b$10$cZmYJvzxcgLyD96t9fNiaeg18X/jqVHH1eJfnJHx1bhUjZCZBzn4S',
        '超级管理员',
        'superadmin'
    );

-- 插入课程数据
INSERT INTO
    courses (
        title,
        description,
        cover,
        rating,
        status,
        view_count
    )
VALUES (
        '软件工程',
        '软件工程是一门研究软件系统开发、维护和运行的学科',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80',
        4.5,
        'published',
        0
    ),
    (
        '数据结构',
        '学习基本数据结构和算法，提高编程能力',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
        4.8,
        'published',
        0
    ),
    (
        '计算机网络',
        '深入理解网络协议和通信原理',
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80',
        4.6,
        'published',
        0
    ),
    (
        '操作系统',
        '学习操作系统的基本概念和原理',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
        4.7,
        'published',
        0
    ),
    (
        '数据库系统',
        '数据库设计和优化技术',
        'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80',
        4.4,
        'published',
        0
    );

-- 插入章节数据
INSERT INTO
    chapters (
        course_id,
        title,
        description,
        order_num
    )
VALUES (
        1,
        '软件工程概述',
        '软件工程的基本概念和发展历史',
        1
    ),
    (1, '需求分析', '软件需求获取和分析方法', 2),
    (1, '软件设计', '软件架构和详细设计', 3),
    (2, '线性表', '数组和链表的基本操作', 1),
    (2, '树结构', '二叉树和树的基本概念', 2),
    (2, '图论基础', '图的基本概念和算法', 3);

-- 插入素材数据
INSERT INTO
    materials (
        chapter_id,
        title,
        type,
        url,
        order_num,
        is_system,
        status
    )
VALUES (
        1,
        '软件工程导论',
        'video',
        'https://media.w3.org/2010/05/sintel/trailer.mp4',
        1,
        false,
        'active'
    ),
    (
        1,
        '软件工程概述PPT',
        'ppt',
        'http://svh1szrh8.hb-bkt.clouddn.com/matriel/%E7%AC%AC1%E7%AB%A0%20%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F%E6%A6%82%E8%BF%B0.pdf?e=1745921813&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:OjrOtDSNtq4xoCyRPDGov-s_olw=',
        2,
        false,
        'active'
    );

-- 插入日程数据
INSERT INTO
    schedules (
        user_id,
        title,
        time,
        description
    )
VALUES (
        1,
        '完成web大作业',
        '4.19 | 14:00-16:00',
        '完成web大作业'
    ),
    (
        1,
        '准备期末考试',
        '4.19 | 19:00-21:00',
        '准备期末考试'
    );

-- 插入习题数据
INSERT INTO
    exercise_sets (
        title,
        description,
        question_count
    )
VALUES (
        'React基础知识测试',
        'React基础概念和核心特性的测试题目',
        2
    ),
    (
        'Vue.js入门测试',
        'Vue.js基础知识测试题目',
        2
    );

INSERT INTO
    questions (
        exercise_set_id,
        content,
        type,
        options,
        answer
    )
VALUES (
        1,
        'React 是什么？',
        'single',
        '["JavaScript库", "编程语言", "操作系统", "数据库"]',
        '["JavaScript库"]'
    ),
    (
        1,
        'React的核心特性包括哪些？',
        'multiple',
        '["组件化", "虚拟DOM", "单向数据流", "JSX语法"]',
        '["组件化", "虚拟DOM", "单向数据流", "JSX语法"]'
    ),
    (
        2,
        'Vue.js的核心是什么？',
        'single',
        '["数据驱动", "组件化", "路由系统", "状态管理"]',
        '["数据驱动"]'
    ),
    (
        2,
        'Vue.js 2.x的特性有哪些？',
        'multiple',
        '["响应式系统", "虚拟DOM", "组件化", "模板语法"]',
        '["响应式系统", "虚拟DOM", "组件化", "模板语法"]'
    );

-- 插入帖子数据
INSERT INTO posts (author_id, content, attachments, type) VALUES
(1, '大家好，我是新来的，请问如何开始学习编程？', '[]', 'help'),
(2, '分享一个学习Python的好方法：每天坚持写代码，从简单的开始。', '[{"type": "image", "url": "https://example.com/image1.jpg"}]', 'normal'),
(3, '有人能推荐一些好的数据结构学习资源吗？', '[{"type": "file", "url": "https://example.com/file1.pdf", "name": "数据结构.pdf"}]', 'help');

-- 插入标签数据
INSERT INTO tags (name) VALUES
('编程'),
('Python'),
('数据结构'),
('学习经验'),
('求助');

-- 插入帖子标签关联数据
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1),
(1, 5),
(2, 1),
(2, 2),
(2, 4),
(3, 1),
(3, 3),
(3, 5);

-- 插入评论数据
INSERT INTO comments (post_id, user_id, content) VALUES
(1, 2, '建议从Python开始，语法简单，容易上手。'),
(1, 3, '可以看看《Python编程：从入门到实践》这本书。'),
(2, 1, '感谢分享，这个方法确实有效！'),
(3, 2, '推荐《算法导论》和LeetCode刷题。');

-- 插入点赞数据
INSERT INTO post_likes (post_id, user_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(2, 3),
(3, 1),
(3, 2);

-- 插入收藏数据
INSERT INTO post_collections (post_id, user_id) VALUES
(1, 2),
(2, 1),
(2, 3),
(3, 1);

-- 插入评论点赞数据
INSERT INTO comment_likes (comment_id, user_id) VALUES
(1, 1),
(1, 3),
(2, 1),
(3, 2),
(4, 1),
(4, 3);