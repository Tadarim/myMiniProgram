-- 创建数据库
CREATE DATABASE learning_system DEFAULT CHARACTER SET = 'utf8mb4';

-- 使用数据库
USE learning_system;

-- 创建用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    background_image VARCHAR(255),
    description TEXT,
    extra JSON
);

-- 创建学习档案表
CREATE TABLE learning_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    learning_style VARCHAR(50),
    learning_goals TEXT,
    learning_history JSON,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 创建管理员表
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
    ),
    (
        '赵六',
        'zhaoliu@example.com',
        '$2b$10$XIYUAwa6FBZFKxli0TG4WureZ4EUsyOZeS0vKHOpqhPxQHEkE55x2',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '物理爱好者',
        '{"gender": 1, "location": ["广东", "深圳"], "school": "深圳大学", "birthday": "2002-04-04", "age": 22, "constellation": "白羊座", "createTime": "2024-01-04 13:00:00", "lastLoginTime": "2024-03-17 18:30:00"}'
    ),
    (
        '钱七',
        'qianqi@example.com',
        '$2b$10$97tnyMHnXCt9iF2CT6PMpOwSJ3JEWgsP4kfubVGvY.3dPpciMv2RS',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '化学爱好者',
        '{"gender": 2, "location": ["浙江", "杭州"], "school": "浙江大学", "birthday": "2001-05-05", "age": 23, "constellation": "金牛座", "createTime": "2024-01-05 14:00:00", "lastLoginTime": "2024-03-16 19:30:00"}'
    ),
    (
        '孙八',
        'sunba@example.com',
        '$2b$10$nlcCXNR.CMqgKtg7YK5Fyu0SgFp0KUOaj7FtE0NozR5BL5kVQ04VC',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '生物爱好者',
        '{"gender": 2, "location": ["江苏", "南京"], "school": "南京大学", "birthday": "2000-06-06", "age": 24, "constellation": "双子座", "createTime": "2024-01-06 15:00:00", "lastLoginTime": "2024-03-15 20:30:00"}'
    ),
    (
        '周九',
        'zhoujiu@example.com',
        '$2b$10$8b8li753UGqesxSjxJXFUOcCCYNsdoUDoPdFFsw4jZu6Do9G0aPmm',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '历史爱好者',
        '{"gender": 2, "location": ["湖北", "武汉"], "school": "武汉大学", "birthday": "1999-07-07", "age": 25, "constellation": "巨蟹座", "createTime": "2024-01-07 16:00:00", "lastLoginTime": "2024-03-14 21:30:00"}'
    ),
    (
        '吴十',
        'wushi@example.com',
        '$2b$10$IpajCNk7DXezKNFwX75dHedW/kIAoT2yyyRJvz/WanjIDZpVnO9Cq',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '地理爱好者',
        '{"gender": 2, "location": ["四川", "成都"], "school": "四川大学", "birthday": "2002-08-08", "age": 22, "constellation": "狮子座", "createTime": "2024-01-08 17:00:00", "lastLoginTime": "2024-03-13 22:30:00"}'
    ),
    (
        '郑十一',
        'zhengshiyi@example.com',
        '$2b$10$bTMmrazeuOgxTXNqvbYfg.e0vidoGVqLXYPvnRveQEKf/T/YeCLu.',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '政治爱好者',
        '{"gender": 1, "location": ["陕西", "西安"], "school": "西安交通大学", "birthday": "2001-09-09", "age": 23, "constellation": "处女座", "createTime": "2024-01-09 18:00:00", "lastLoginTime": "2024-03-12 23:30:00"}'
    ),
    (
        '王十二',
        'wangshier@example.com',
        '$2b$10$PNKLBuXRq0ccrhZuW3Ie8eKmc0FqHgu.dM8QfI6qdlZog4BKwmY9y',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
        'https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png',
        '经济爱好者',
        '{"gender": 1, "location": ["重庆", "市辖区"], "school": "重庆大学", "birthday": "2000-10-10", "age": 24, "constellation": "天秤座", "createTime": "2024-01-10 19:00:00", "lastLoginTime": "2024-03-11 00:30:00"}'
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
    ),
    (
        4,
        '视觉型',
        '研究量子物理',
        '{"completed_courses": ["大学物理", "量子力学基础"], "current_courses": ["量子计算"], "achievements": ["物理竞赛二等奖"]}'
    ),
    (
        5,
        '听觉型',
        '掌握有机化学',
        '{"completed_courses": ["无机化学", "有机化学基础"], "current_courses": ["生物化学"], "achievements": ["化学实验技能大赛三等奖"]}'
    ),
    (
        6,
        '动手型',
        '学习分子生物学',
        '{"completed_courses": ["细胞生物学", "遗传学"], "current_courses": ["分子生物学"], "achievements": ["生物实验技能大赛一等奖"]}'
    ),
    (
        7,
        '视觉型',
        '研究中国古代史',
        '{"completed_courses": ["中国通史", "世界通史"], "current_courses": ["中国古代史专题"], "achievements": ["历史论文比赛一等奖"]}'
    ),
    (
        8,
        '听觉型',
        '学习地理信息系统',
        '{"completed_courses": ["自然地理", "人文地理"], "current_courses": ["GIS应用"], "achievements": ["地理知识竞赛二等奖"]}'
    ),
    (
        9,
        '动手型',
        '研究国际关系',
        '{"completed_courses": ["政治学原理", "国际关系理论"], "current_courses": ["中国外交"], "achievements": ["模拟联合国最佳代表"]}'
    ),
    (
        10,
        '视觉型',
        '学习宏观经济学',
        '{"completed_courses": ["微观经济学", "宏观经济学基础"], "current_courses": ["计量经济学"], "achievements": ["经济论文比赛三等奖"]}'
    );

-- 插入管理员数据
-- 密码使用 bcrypt 加密，原始密码为 admin123 和 superadmin123
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


    -- 添加status字段
-- 修改status字段的默认值
ALTER TABLE materials
ALTER COLUMN status SET DEFAULT 'active';

-- 添加is_system字段
ALTER TABLE materials
ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT false;