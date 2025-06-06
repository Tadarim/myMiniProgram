-- MySQL dump 10.13  Distrib 9.2.0, for macos15 (arm64)
--
-- Host: localhost    Database: learning_system
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin','$2b$10$YiigDBw3kTLaQxl6Na2WTOhbf8JpZQwzWVw5XyFjzepN9oorhMRCq','普通管理员',NULL,'admin','2025-05-02 03:01:59','2025-05-02 03:01:59'),(2,'superadmin','$2b$10$cZmYJvzxcgLyD96t9fNiaeg18X/jqVHH1eJfnJHx1bhUjZCZBzn4S','超级管理员',NULL,'superadmin','2025-05-02 03:01:59','2025-05-02 03:01:59');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chapters`
--

DROP TABLE IF EXISTS `chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `order_num` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `chapters_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapters`
--

LOCK TABLES `chapters` WRITE;
/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
INSERT INTO `chapters` VALUES (1,1,'软件工程概述','软件工程的基本概念和发展历史',1,'2025-05-02 03:01:59','2025-05-02 03:01:59'),(2,1,'需求分析','软件需求获取和分析方法',2,'2025-05-02 03:01:59','2025-05-02 03:01:59'),(3,1,'软件设计','软件架构和详细设计',3,'2025-05-02 03:01:59','2025-05-02 03:01:59'),(4,2,'线性表','数组和链表的基本操作',1,'2025-05-02 03:01:59','2025-05-02 03:01:59'),(5,2,'树结构','二叉树和树的基本概念',2,'2025-05-02 03:01:59','2025-05-02 03:01:59'),(6,2,'图论基础','图的基本概念和算法',3,'2025-05-02 03:01:59','2025-05-02 03:01:59'),(7,3,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(8,4,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(9,5,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(10,6,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(11,7,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(12,8,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(13,9,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(14,10,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(15,11,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(16,12,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(17,13,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(18,14,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(19,15,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(20,16,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(21,17,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(22,18,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(23,19,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(24,20,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(25,21,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(26,22,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(27,23,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(28,24,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(29,25,'第1章 课程导论','课程内容与学习目标介绍',1,'2025-05-11 14:43:50','2025-05-11 14:43:50'),(38,3,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(39,4,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(40,5,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(41,6,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(42,7,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(43,8,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(44,9,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(45,10,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(46,11,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(47,12,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(48,13,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(49,14,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(50,15,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(51,16,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(52,17,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(53,18,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(54,19,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(55,20,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(56,21,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(57,22,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(58,23,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(59,24,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(60,25,'第2章 基础知识','本课程的基础知识点',2,'2025-05-11 14:44:03','2025-05-11 14:44:03'),(69,3,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(70,4,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(71,5,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(72,6,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(73,7,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(74,8,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(75,9,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(76,10,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(77,11,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(78,12,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(79,13,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(80,14,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(81,15,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(82,16,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(83,17,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(84,18,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(85,19,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(86,20,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(87,21,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(88,22,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(89,23,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(90,24,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54'),(91,25,'第3章 实践与案例','实际案例分析与实践',3,'2025-05-11 14:44:54','2025-05-11 14:44:54');
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_group_members`
--

DROP TABLE IF EXISTS `chat_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_group_members` (
  `group_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('member','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chat_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_group_members`
--

LOCK TABLES `chat_group_members` WRITE;
/*!40000 ALTER TABLE `chat_group_members` DISABLE KEYS */;
INSERT INTO `chat_group_members` VALUES (1,1,'admin','2025-05-11 09:05:33'),(1,2,'member','2025-05-11 09:05:33'),(1,3,'member','2025-05-11 09:05:33'),(1,4,'member','2025-05-11 09:09:41'),(2,1,'member','2025-05-11 09:05:33'),(2,2,'admin','2025-05-11 09:05:33'),(2,3,'member','2025-05-11 09:05:33'),(2,4,'member','2025-05-11 10:18:13'),(3,1,'member','2025-05-11 09:05:33'),(3,2,'member','2025-05-11 09:05:33'),(3,3,'admin','2025-05-11 09:05:33'),(3,4,'member','2025-05-11 09:09:41'),(5,1,'admin','2025-05-11 11:34:33'),(5,2,'member','2025-05-11 11:34:33'),(5,3,'member','2025-05-11 11:34:33'),(5,4,'member','2025-05-14 00:59:49'),(6,1,'member','2025-05-11 11:34:34'),(6,2,'admin','2025-05-11 11:34:34'),(6,3,'member','2025-05-11 11:34:34'),(6,4,'member','2025-05-11 11:34:34'),(7,1,'member','2025-05-11 11:34:36'),(7,2,'member','2025-05-11 11:34:36'),(7,3,'admin','2025-05-11 11:34:36'),(8,1,'member','2025-05-11 11:34:38'),(8,2,'member','2025-05-11 11:34:38'),(8,3,'member','2025-05-11 11:34:38'),(8,4,'admin','2025-05-11 11:34:38');
/*!40000 ALTER TABLE `chat_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_groups`
--

DROP TABLE IF EXISTS `chat_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `chat_groups_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_groups`
--

LOCK TABLES `chat_groups` WRITE;
/*!40000 ALTER TABLE `chat_groups` DISABLE KEYS */;
INSERT INTO `chat_groups` VALUES (1,'算法学习小组','讨论算法问题和解决方案','https://api.dicebear.com/7.x/identicon/svg?seed=algorithm',1,'2025-05-11 09:05:32','2025-05-11 09:05:32'),(2,'Web开发交流群','分享Web开发经验和技术','https://api.dicebear.com/7.x/identicon/svg?seed=webdev',2,'2025-05-11 09:05:32','2025-05-11 09:05:32'),(3,'人工智能研究','AI技术研究与应用讨论','https://api.dicebear.com/7.x/identicon/svg?seed=ai',3,'2025-05-11 09:05:32','2025-05-11 09:05:32'),(5,'学习交流群1','一起学习进步','https://api.dicebear.com/7.x/identicon/svg?seed=study',1,'2025-05-11 11:26:05','2025-05-11 11:30:18'),(6,'学习交流群2','刷题打卡','https://api.dicebear.com/7.x/identicon/svg?seed=test',2,'2025-05-11 11:26:05','2025-05-11 11:29:41'),(7,'学习交流群3','算法讨论','https://api.dicebear.com/7.x/identicon/svg?seed=test2',3,'2025-05-11 11:26:05','2025-05-11 11:30:18'),(8,'学习交流群4','前端技术','https://api.dicebear.com/7.x/identicon/svg?seed=dev',4,'2025-05-11 11:26:05','2025-05-11 11:29:41');
/*!40000 ALTER TABLE `chat_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `type` enum('text','image','file','audio','video') COLLATE utf8mb4_unicode_ci DEFAULT 'text',
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chat_messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,1,1,2,'你好，李四！','text',NULL,NULL,NULL,1,'2025-05-09 02:30:00'),(2,1,2,1,'你好，张三！最近在忙什么？','text',NULL,NULL,NULL,1,'2025-05-09 02:35:00'),(3,1,1,2,'在学习数据结构，你呢？','text',NULL,NULL,NULL,1,'2025-05-09 02:40:00'),(4,1,2,1,'我在做Web项目，挺忙的','text',NULL,NULL,NULL,1,'2025-05-09 03:00:00'),(5,1,1,2,'周末有时间一起讨论学习吗？','text',NULL,NULL,NULL,1,'2025-05-10 01:15:00'),(6,1,2,1,'可以啊，周六下午怎么样？','text',NULL,NULL,NULL,1,'2025-05-10 01:30:00'),(7,1,1,2,'没问题，到时候见','text',NULL,NULL,NULL,1,'2025-05-10 02:00:00'),(8,1,1,2,'今天我们讨论一下项目进度吧','text',NULL,NULL,NULL,1,'2025-05-10 07:30:00'),(9,2,1,3,'王五，你上课笔记能借我看看吗？','text',NULL,NULL,NULL,1,'2025-05-11 00:30:00'),(10,2,3,1,'当然可以，我发你邮箱？','text',NULL,NULL,NULL,1,'2025-05-11 01:00:00'),(11,2,1,3,'好的，谢谢！','text',NULL,NULL,NULL,1,'2025-05-11 01:10:00'),(12,2,3,1,'已发送，查收一下','text',NULL,NULL,NULL,1,'2025-05-11 02:00:00'),(13,2,1,3,'收到了，非常感谢！','text',NULL,NULL,NULL,1,'2025-05-11 02:15:00'),(14,2,3,1,'不客气，有问题随时问我','text',NULL,NULL,NULL,1,'2025-05-11 02:20:00'),(15,2,1,3,'明天记得带课本','text',NULL,NULL,NULL,1,'2025-05-11 06:20:00'),(37,3,1,0,'大家好，欢迎加入算法学习小组！','text',NULL,NULL,NULL,1,'2025-05-11 00:00:00'),(38,3,2,0,'谢谢邀请，很高兴加入！','text',NULL,NULL,NULL,1,'2025-05-11 00:10:00'),(39,3,3,0,'这个小组主要讨论什么算法？','text',NULL,NULL,NULL,1,'2025-05-11 00:15:00'),(40,3,1,0,'我们主要讨论常见算法和解题技巧，比如动态规划、图论等','text',NULL,NULL,NULL,1,'2025-05-11 00:20:00'),(41,3,2,0,'有关于链表操作的好资源分享吗？','text',NULL,NULL,NULL,1,'2025-05-11 01:30:00'),(42,3,1,0,'推荐《算法导论》第10章，讲解很详细','text',NULL,NULL,NULL,1,'2025-05-11 01:35:00'),(43,3,3,0,'大家好，请问这个群组讨论哪些算法内容？','text',NULL,NULL,NULL,1,'2025-05-11 06:28:55'),(44,4,2,0,'欢迎大家加入Web开发交流群！','text',NULL,NULL,NULL,1,'2025-05-11 02:00:00'),(45,4,1,0,'很高兴加入，我目前正在学习React','text',NULL,NULL,NULL,1,'2025-05-11 02:10:00'),(46,4,3,0,'我对Vue比较熟悉，希望能和大家交流','text',NULL,NULL,NULL,1,'2025-05-11 02:15:00'),(47,4,2,0,'太好了，我们可以分享各自的开发经验','text',NULL,NULL,NULL,1,'2025-05-11 02:20:00'),(48,4,1,0,'最近在做一个React项目，遇到了性能问题','text',NULL,NULL,NULL,1,'2025-05-11 03:30:00'),(49,4,2,0,'可以尝试使用React.memo和useCallback优化','text',NULL,NULL,NULL,1,'2025-05-11 03:35:00'),(50,4,3,0,'有关于React组件优化的好建议吗？','text',NULL,NULL,NULL,1,'2025-05-11 04:18:39'),(51,5,3,0,'欢迎来到人工智能研究群！','text',NULL,NULL,NULL,1,'2025-05-11 05:00:00'),(52,5,1,0,'很高兴加入，我对机器学习很感兴趣','text',NULL,NULL,NULL,1,'2025-05-11 05:10:00'),(53,5,2,0,'我在学习神经网络，希望能和大家交流','text',NULL,NULL,NULL,1,'2025-05-11 05:15:00'),(54,5,3,0,'我们可以一起讨论最新的AI技术和论文','text',NULL,NULL,NULL,1,'2025-05-11 05:20:00'),(55,5,1,0,'有人在用TensorFlow做项目吗？','text',NULL,NULL,NULL,1,'2025-05-11 06:00:00'),(56,5,3,0,'我在用，有什么问题可以问我','text',NULL,NULL,NULL,1,'2025-05-11 06:05:00'),(57,5,1,0,'对AI很感兴趣，期待和大家一起学习交流！','text',NULL,NULL,NULL,1,'2025-05-11 06:28:55'),(59,9,4,1,'你好','text',NULL,NULL,NULL,1,'2025-05-11 09:16:35'),(62,9,4,1,'http://svh1szrh8.hb-bkt.clouddn.com/chat-cb9c9950-0f56-4ef8-a705-963d5aab962f?e=1747046167&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:ywswFcyj4rbnl9T0_MP04Ls22h0=&attname=%5Bobject%20Undefined%5D','image','http://svh1szrh8.hb-bkt.clouddn.com/chat-cb9c9950-0f56-4ef8-a705-963d5aab962f?e=1747046167&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:ywswFcyj4rbnl9T0_MP04Ls22h0=&attname=%5Bobject%20Undefined%5D','[object Undefined]',1280,1,'2025-05-11 10:36:07'),(64,4,4,2,'http://svh1szrh8.hb-bkt.clouddn.com/chat-20a4e6c8-2e73-4a76-aad2-b57081747448?e=1747046373&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:_6hcw3K-5LyEZjbWbfs9cv89bu0=&attname=%5Bobject%20Undefined%5D','image','http://svh1szrh8.hb-bkt.clouddn.com/chat-20a4e6c8-2e73-4a76-aad2-b57081747448?e=1747046373&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:_6hcw3K-5LyEZjbWbfs9cv89bu0=&attname=%5Bobject%20Undefined%5D','[object Undefined]',39183,0,'2025-05-11 10:39:33'),(87,22,1,1,'大家好，欢迎加入学习交流群1！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(88,22,2,1,'群主好！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(89,22,3,1,'大家一起加油！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(90,23,2,2,'群2开聊啦！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(91,23,3,2,'收到！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(92,23,4,2,'大家好！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(93,24,3,3,'群3欢迎新成员！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(94,24,1,3,'谢谢群主！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(95,24,2,3,'大家多交流！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(96,25,4,4,'群4上线！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(97,25,1,4,'大家好！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(98,25,2,4,'新朋友欢迎！','text',NULL,NULL,NULL,0,'2025-05-11 11:49:23'),(99,9,4,1,'你好啊','text',NULL,NULL,NULL,1,'2025-05-12 06:00:59'),(100,9,1,4,'test','text',NULL,NULL,NULL,1,'2025-05-12 06:03:26'),(101,9,4,1,'你好啊','text',NULL,NULL,NULL,0,'2025-05-12 06:07:19'),(102,9,4,1,'你好','text',NULL,NULL,NULL,0,'2025-05-12 08:08:15'),(103,27,4,2,'你好啊','text',NULL,NULL,NULL,0,'2025-05-12 08:48:46'),(104,26,4,3,'http://svh1szrh8.hb-bkt.clouddn.com/chat-4acaa99d-9441-48bb-b6ad-cd6951762190?e=1747126637&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:DUtyaBVRZtyTGZuUq_MpBt_UifY=&attname=%5Bobject%20Undefined%5D','image','http://svh1szrh8.hb-bkt.clouddn.com/chat-4acaa99d-9441-48bb-b6ad-cd6951762190?e=1747126637&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:DUtyaBVRZtyTGZuUq_MpBt_UifY=&attname=%5Bobject%20Undefined%5D','[object Undefined]',3321,0,'2025-05-12 08:57:17'),(106,26,4,3,'hello','text',NULL,NULL,NULL,0,'2025-05-13 00:26:53'),(108,26,4,3,'你好','text',NULL,NULL,NULL,0,'2025-05-14 12:17:52'),(109,26,4,3,'你好','text',NULL,NULL,NULL,0,'2025-05-15 08:41:07');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_sessions`
--

DROP TABLE IF EXISTS `chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `target_id` int NOT NULL,
  `type` enum('single','group') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'single',
  `group_id` int DEFAULT NULL,
  `last_message` text COLLATE utf8mb4_unicode_ci,
  `last_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `unread_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_single_chat_session` (`type`,`user_id`,`target_id`),
  KEY `user_id` (`user_id`),
  KEY `target_id` (`target_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chat_sessions_ibfk_2` FOREIGN KEY (`target_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chat_sessions_ibfk_3` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_sessions`
--

LOCK TABLES `chat_sessions` WRITE;
/*!40000 ALTER TABLE `chat_sessions` DISABLE KEYS */;
INSERT INTO `chat_sessions` VALUES (1,1,2,'single',NULL,'今天我们讨论一下项目进度吧','2025-05-10 07:30:00',0,'2025-05-11 09:05:35','2025-05-11 09:05:35'),(2,1,3,'single',NULL,'明天记得带课本','2025-05-11 06:20:00',0,'2025-05-11 09:05:35','2025-05-11 09:05:35'),(3,1,1,'group',1,'大家好，请问这个群组讨论哪些算法内容？','2025-05-11 06:28:55',0,'2025-05-11 09:05:36','2025-05-11 09:05:36'),(4,2,2,'group',2,'[文件] 课内实验报告模板.doc','2025-05-11 10:39:55',0,'2025-05-11 09:05:36','2025-05-11 10:39:55'),(5,3,3,'group',3,'对AI很感兴趣，期待和大家一起学习交流！','2025-05-11 06:28:55',0,'2025-05-11 09:05:36','2025-05-11 09:05:36'),(9,1,4,'single',NULL,'你好','2025-05-12 08:08:15',0,'2025-05-11 09:09:22','2025-05-12 08:08:19'),(22,1,2,'group',5,'微信用户加入了群聊','2025-05-14 00:59:49',0,'2025-05-11 11:46:53','2025-05-14 00:59:49'),(23,2,3,'group',6,'欢迎加入学习交流群2','2025-05-11 11:46:53',0,'2025-05-11 11:46:53','2025-05-11 11:46:53'),(24,3,4,'group',7,'微信用户退出了群聊','2025-05-11 11:50:21',0,'2025-05-11 11:46:53','2025-05-11 11:50:21'),(25,4,1,'group',8,'欢迎加入学习交流群4','2025-05-11 11:46:53',0,'2025-05-11 11:46:53','2025-05-11 11:46:53'),(26,3,4,'single',NULL,'你好','2025-05-15 08:41:07',0,'2025-05-12 05:45:45','2025-05-19 08:45:42'),(27,2,4,'single',NULL,'你好啊','2025-05-12 08:48:46',0,'2025-05-12 05:49:36','2025-05-15 08:41:20');
/*!40000 ALTER TABLE `chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment_likes`
--

DROP TABLE IF EXISTS `comment_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_likes` (
  `comment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comment_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment_likes`
--

LOCK TABLES `comment_likes` WRITE;
/*!40000 ALTER TABLE `comment_likes` DISABLE KEYS */;
INSERT INTO `comment_likes` VALUES (1,1,'2025-05-06 07:33:49'),(1,3,'2025-05-06 07:33:49'),(2,1,'2025-05-06 07:33:49'),(3,2,'2025-05-06 07:33:49'),(4,1,'2025-05-06 07:33:49'),(4,3,'2025-05-06 07:33:49');
/*!40000 ALTER TABLE `comment_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_post_id` (`post_id`),
  KEY `idx_comments_user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,2,'建议从Python开始，语法简单，容易上手。','2025-05-06 07:33:43','2025-05-06 07:33:43'),(2,1,3,'可以看看《Python编程：从入门到实践》这本书。','2025-05-06 07:33:43','2025-05-06 07:33:43'),(3,2,1,'感谢分享，这个方法确实有效！','2025-05-06 07:33:43','2025-05-06 07:33:43'),(4,3,2,'推荐《算法导论》和LeetCode刷题。','2025-05-06 07:33:43','2025-05-06 07:33:43'),(5,1,4,'你好','2025-05-07 02:37:46','2025-05-07 02:37:46'),(7,26,4,'你好','2025-05-09 15:05:47','2025-05-09 15:05:47');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_tags`
--

DROP TABLE IF EXISTS `course_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_tags` (
  `course_id` int NOT NULL,
  `tag_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `course_tags_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_tags`
--

LOCK TABLES `course_tags` WRITE;
/*!40000 ALTER TABLE `course_tags` DISABLE KEYS */;
INSERT INTO `course_tags` VALUES (1,10,'2025-05-11 15:30:48'),(1,37,'2025-05-11 15:30:48'),(2,11,'2025-05-11 15:30:48'),(2,12,'2025-05-11 15:30:48'),(2,37,'2025-05-11 15:30:48'),(3,12,'2025-05-11 15:30:48'),(3,21,'2025-05-11 15:30:48'),(3,37,'2025-05-11 15:30:48'),(4,37,'2025-05-11 15:30:48'),(5,15,'2025-05-11 15:30:48'),(5,37,'2025-05-11 15:30:48'),(6,10,'2025-05-11 15:30:48'),(6,37,'2025-05-11 15:30:48'),(7,10,'2025-05-11 15:30:48'),(7,37,'2025-05-11 15:30:48'),(8,13,'2025-05-11 15:30:48'),(8,37,'2025-05-11 15:30:48'),(9,14,'2025-05-11 15:30:48'),(9,37,'2025-05-11 15:30:48'),(10,19,'2025-05-11 15:30:48'),(10,37,'2025-05-11 15:30:48'),(11,16,'2025-05-11 15:30:48'),(11,37,'2025-05-11 15:30:48'),(12,17,'2025-05-11 15:30:48'),(12,18,'2025-05-11 15:30:48'),(12,37,'2025-05-11 15:30:48'),(13,17,'2025-05-11 15:30:48'),(13,18,'2025-05-11 15:30:48'),(13,37,'2025-05-11 15:30:48'),(14,18,'2025-05-11 15:30:48'),(14,37,'2025-05-11 15:30:48'),(15,13,'2025-05-11 15:30:48'),(15,14,'2025-05-11 15:30:48'),(15,37,'2025-05-11 15:30:48'),(16,37,'2025-05-11 15:30:48'),(17,21,'2025-05-11 15:30:48'),(17,37,'2025-05-11 15:30:48'),(18,11,'2025-05-11 15:30:48'),(18,12,'2025-05-11 15:30:48'),(18,37,'2025-05-11 15:30:48'),(19,22,'2025-05-11 15:30:48'),(19,37,'2025-05-11 15:30:48'),(20,20,'2025-05-11 15:30:48'),(20,37,'2025-05-11 15:30:48'),(21,19,'2025-05-11 15:30:48'),(21,37,'2025-05-11 15:30:48'),(22,23,'2025-05-11 15:30:48'),(22,37,'2025-05-11 15:30:48'),(23,24,'2025-05-11 15:30:48'),(23,37,'2025-05-11 15:30:48'),(24,25,'2025-05-11 15:30:48'),(24,37,'2025-05-11 15:30:48'),(25,26,'2025-05-11 15:30:48'),(25,37,'2025-05-11 15:30:48');
/*!40000 ALTER TABLE `course_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `view_count` int NOT NULL DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'软件工程','软件工程是一门研究软件系统开发、维护和运行的学科','https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80',3.00,108,'published','2025-05-04 09:40:17','2025-05-19 08:44:40'),(2,'数据结构','学习基本数据结构和算法，提高编程能力','https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',4.80,6,'published','2025-05-04 09:40:17','2025-05-10 11:13:43'),(3,'计算机网络','深入理解网络协议和通信原理','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80',4.60,2,'published','2025-05-04 09:40:17','2025-05-09 13:50:05'),(4,'操作系统','学习操作系统的基本概念和原理','https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',4.70,3,'published','2025-05-04 09:40:17','2025-05-19 08:44:34'),(5,'数据库系统','数据库设计和优化技术','https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&q=80',4.40,0,'published','2025-05-04 09:40:17','2025-05-04 09:40:17'),(6,'Java编程基础','学习Java语言的基本语法和开发技巧','https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80',4.50,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(7,'C语言入门','C语言基础知识与编程实践','https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=500&q=80',4.30,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(8,'前端开发实战','HTML、CSS、JavaScript综合应用','https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80',4.70,1,'published','2025-05-11 14:28:15','2025-05-11 15:48:39'),(9,'后端开发入门','Node.js与Express框架开发','https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500&q=80',4.60,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(10,'数据分析基础','数据分析流程与常用工具','https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',4.80,0,'published','2025-05-11 14:28:15','2025-05-11 14:43:36'),(11,'人工智能导论','AI基础理论与应用场景','https://images.unsplash.com/photo-1503676382389-4809596d5290?w=500&q=80',4.90,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(12,'机器学习实战','机器学习算法与案例','https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',4.70,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(13,'深度学习入门','神经网络与深度学习基础','https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500&q=80',4.80,7,'published','2025-05-11 14:28:15','2025-05-19 08:44:11'),(14,'Python数据可视化','用Python进行数据可视化','https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80',4.60,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(15,'Web全栈开发','前后端一体化开发实践','https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',4.70,0,'published','2025-05-11 14:28:15','2025-05-11 14:43:36'),(16,'Linux操作系统','Linux系统基础与命令行','https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500&q=80',4.50,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(17,'网络安全基础','网络安全原理与防护','https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80',4.40,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(18,'算法与数据结构','常用算法与数据结构讲解','https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80',4.90,2,'published','2025-05-11 14:28:15','2025-05-15 08:43:59'),(19,'移动开发基础','Android与iOS开发入门','https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=500&q=80',4.30,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(20,'云计算导论','云计算基础与应用','https://images.unsplash.com/photo-1503676382389-4809596d5290?w=500&q=80',4.60,2,'published','2025-05-11 14:28:15','2025-05-19 08:44:28'),(21,'大数据技术','大数据平台与分析','https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',4.70,1,'published','2025-05-11 14:28:15','2025-05-19 08:44:26'),(22,'软件测试基础','软件测试理论与实践','https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500&q=80',4.50,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(23,'项目管理实务','IT项目管理流程与工具','https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80',4.40,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15'),(24,'产品设计基础','产品设计流程与方法','https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80',4.60,1,'published','2025-05-11 14:28:15','2025-05-11 14:45:19'),(25,'区块链技术','区块链原理与开发','https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500&q=80',4.80,0,'published','2025-05-11 14:28:15','2025-05-11 14:28:15');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_completions`
--

DROP TABLE IF EXISTS `exercise_completions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise_completions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exercise_set_id` int NOT NULL,
  `user_id` int NOT NULL,
  `completed_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exercise_completions_exercise_set_id` (`exercise_set_id`),
  KEY `idx_exercise_completions_user_id` (`user_id`),
  CONSTRAINT `exercise_completions_ibfk_1` FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_sets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exercise_completions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_completions`
--

LOCK TABLES `exercise_completions` WRITE;
/*!40000 ALTER TABLE `exercise_completions` DISABLE KEYS */;
INSERT INTO `exercise_completions` VALUES (1,1,4,'2025-05-06 11:25:10','2025-05-06 03:25:10','2025-05-06 03:25:10');
/*!40000 ALTER TABLE `exercise_completions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_sets`
--

DROP TABLE IF EXISTS `exercise_sets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise_sets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `question_count` int NOT NULL DEFAULT '0',
  `complete_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_sets`
--

LOCK TABLES `exercise_sets` WRITE;
/*!40000 ALTER TABLE `exercise_sets` DISABLE KEYS */;
INSERT INTO `exercise_sets` VALUES (1,'React基础知识测试','React基础概念和核心特性的测试题目',2,1,'2025-05-04 09:41:58','2025-05-06 03:25:10'),(2,'Vue.js入门测试','Vue.js基础知识测试题目',2,0,'2025-05-04 09:41:58','2025-05-04 09:41:58'),(3,'JavaScript高级编程技巧','JavaScript进阶知识和常用设计模式',5,120,'2025-05-10 15:36:41','2025-05-10 15:36:41'),(4,'Python数据分析基础','Python数据处理和分析基础知识',8,95,'2025-05-10 15:36:47','2025-05-10 15:36:47'),(5,'Java核心编程','Java语言核心概念与实践',10,75,'2025-05-10 15:36:51','2025-05-10 15:36:51'),(6,'C++数据结构实现','C++语言实现常见数据结构',12,60,'2025-05-10 15:36:56','2025-05-10 15:36:56'),(7,'微信小程序开发入门','微信小程序开发基础知识与实践',6,150,'2025-05-10 15:37:01','2025-05-10 15:37:01'),(8,'Flutter跨平台开发','Flutter框架基础与UI组件开发',7,80,'2025-05-10 15:37:06','2025-05-10 15:37:06'),(9,'SQL数据库设计','关系型数据库设计原则与实践',9,45,'2025-05-10 15:37:11','2025-05-10 15:37:11'),(10,'Node.js后端开发','Node.js服务端应用开发',8,65,'2025-05-10 15:37:16','2025-05-10 15:37:16');
/*!40000 ALTER TABLE `exercise_sets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_tags`
--

DROP TABLE IF EXISTS `exercise_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exercise_set_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_exercise_tag` (`exercise_set_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `exercise_tags_ibfk_1` FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_sets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exercise_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_tags`
--

LOCK TABLES `exercise_tags` WRITE;
/*!40000 ALTER TABLE `exercise_tags` DISABLE KEYS */;
INSERT INTO `exercise_tags` VALUES (11,1,27),(12,1,29),(13,1,37),(14,2,27),(15,2,29),(16,2,37),(17,3,29),(18,3,31),(19,3,37),(20,4,28),(21,4,29),(22,4,37),(23,5,29),(24,5,37),(25,6,29),(26,6,30),(27,6,37),(28,7,27),(29,7,31),(30,7,37),(31,8,27),(32,8,31),(33,8,37),(34,9,28),(35,9,37),(36,10,29),(37,10,37);
/*!40000 ALTER TABLE `exercise_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `target_id` int NOT NULL,
  `target_type` enum('course','exercise','post') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`user_id`,`target_id`,`target_type`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (18,4,1,'exercise','2025-05-09 16:15:19'),(19,4,26,'post','2025-05-09 16:15:25'),(22,4,2,'course','2025-05-10 11:13:45'),(23,4,1,'course','2025-05-15 08:40:31');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history_records`
--

DROP TABLE IF EXISTS `history_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `target_id` int NOT NULL,
  `target_type` enum('course','exercise','post') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_history` (`user_id`,`target_id`,`target_type`),
  CONSTRAINT `history_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_records`
--

LOCK TABLES `history_records` WRITE;
/*!40000 ALTER TABLE `history_records` DISABLE KEYS */;
INSERT INTO `history_records` VALUES (1,4,1,'course','2025-05-10 02:29:56'),(74,4,2,'course','2025-05-10 03:00:22'),(76,4,26,'post','2025-05-10 03:14:55'),(77,4,0,'exercise','2025-05-10 11:13:29'),(81,4,8,'exercise','2025-05-10 15:39:03'),(82,4,4,'exercise','2025-05-10 15:39:08'),(84,4,7,'exercise','2025-05-10 15:45:07'),(85,4,5,'exercise','2025-05-10 15:45:13'),(101,4,1,'post','2025-05-10 15:56:45'),(148,4,3,'exercise','2025-05-11 07:08:11'),(150,1,1,'course','2025-05-11 11:17:25'),(151,4,13,'course','2025-05-11 14:31:25'),(154,4,24,'course','2025-05-11 14:45:19'),(156,4,18,'course','2025-05-11 15:48:28'),(157,4,4,'course','2025-05-11 15:48:32'),(158,4,20,'course','2025-05-11 15:48:36'),(159,4,8,'course','2025-05-11 15:48:39'),(162,4,2,'exercise','2025-05-12 05:56:52'),(164,4,2,'post','2025-05-14 00:56:10'),(166,4,28,'post','2025-05-14 00:57:31'),(167,1,28,'post','2025-05-14 00:58:21'),(169,4,1,'exercise','2025-05-15 08:40:50'),(173,4,21,'course','2025-05-19 08:44:26'),(177,4,10,'exercise','2025-05-19 08:44:56'),(179,4,6,'exercise','2025-05-19 08:45:12');
/*!40000 ALTER TABLE `history_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chapter_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('video','ppt','pdf','doc','txt','image','audio') COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_num` int NOT NULL,
  `status` enum('pending','approved','rejected','active') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `chapter_id` (`chapter_id`),
  CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,1,'软件工程导论','video','https://media.w3.org/2010/05/sintel/trailer.mp4',1,'active',0,'2025-05-02 03:01:59','2025-05-02 03:01:59'),(2,1,'软件工程概述PPT','ppt','http://svh1szrh8.hb-bkt.clouddn.com/matriel/%E7%AC%AC1%E7%AB%A0%20%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F%E6%A6%82%E8%BF%B0.pdf?e=1745921813&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:OjrOtDSNtq4xoCyRPDGov-s_olw=',2,'active',0,'2025-05-02 03:01:59','2025-05-02 03:01:59'),(3,48,'课内实验报告模板.doc','doc','http://svh1szrh8.hb-bkt.clouddn.com/ca653851-b543-4fac-a447-a949cc12b84d.doc?e=1747270056&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:ypIpCNH-pLROsqTht7R1rXiEwxo=&attname=%E8%AF%BE%E5%86%85%E5%AE%9E%E9%AA%8C%E6%8A%A5%E5%91%8A%E6%A8%A1%E6%9D%BF.doc',1,'pending',0,'2025-05-14 00:47:36','2025-05-14 00:47:36');
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_likes`
--

DROP TABLE IF EXISTS `post_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_likes` (
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_likes`
--

LOCK TABLES `post_likes` WRITE;
/*!40000 ALTER TABLE `post_likes` DISABLE KEYS */;
INSERT INTO `post_likes` VALUES (1,2,'2025-05-06 07:33:46'),(1,3,'2025-05-06 07:33:46'),(1,4,'2025-05-07 03:27:56'),(2,1,'2025-05-06 07:33:46'),(2,3,'2025-05-06 07:33:46'),(2,4,'2025-05-07 08:32:00'),(3,1,'2025-05-06 07:33:46'),(3,2,'2025-05-06 07:33:46');
/*!40000 ALTER TABLE `post_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_tags` (
  `post_id` int NOT NULL,
  `tag_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_tags`
--

LOCK TABLES `post_tags` WRITE;
/*!40000 ALTER TABLE `post_tags` DISABLE KEYS */;
INSERT INTO `post_tags` VALUES (1,32,'2025-05-11 15:29:42'),(1,37,'2025-05-11 15:29:42'),(1,38,'2025-05-11 15:29:42'),(2,32,'2025-05-11 15:29:42'),(2,33,'2025-05-11 15:29:42'),(2,37,'2025-05-11 15:29:42'),(2,38,'2025-05-11 15:29:42'),(3,32,'2025-05-11 15:29:42'),(3,34,'2025-05-11 15:29:42'),(3,37,'2025-05-11 15:29:42'),(3,38,'2025-05-11 15:29:42'),(26,40,'2025-05-11 15:29:42'),(28,41,'2025-05-14 00:57:29'),(29,40,'2025-05-15 08:41:49');
/*!40000 ALTER TABLE `post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `author_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachments` json DEFAULT NULL,
  `type` enum('normal','help') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `status` enum('public','private') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,1,'大家好，我是新来的，请问如何开始学习编程？','[]','help','public','2025-05-07 07:54:33','2025-05-07 07:54:33'),(2,2,'分享一个学习Python的好方法：每天坚持写代码，从简单的开始。','[{\"url\": \"http://svh1szrh8.hb-bkt.clouddn.com/6bf70a13-2995-4e76-9d91-1696e363f763.png?e=1746605229&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:Lvk-XnZlfQ61B9YdGh8Xtaht7tc=\", \"type\": \"image\"}]','normal','public','2025-05-07 07:54:33','2025-05-07 08:02:32'),(3,3,'有人能推荐一些好的数据结构学习资源吗？','[{\"url\": \"http://svh1szrh8.hb-bkt.clouddn.com/bd834e1b-7d62-444f-b09b-3ace63854caa.pdf?e=1746692466&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:YQxejmBImvWVsfSVcyFnHZMxmuU=\", \"name\": \"数据结构.pdf\", \"type\": \"file\"}]','help','public','2025-05-07 07:54:33','2025-05-07 08:22:13'),(26,4,'文件','[{\"url\": \"http://svh1szrh8.hb-bkt.clouddn.com/45cf7855-64ef-4a08-bea7-f86d3f4c68bf.pdf?e=1746634444&token=t9tFAHpiRLkK3J75FBeRqS309DqrnCOW-XBMlOT4:eJAGJ3XNJ9bgr7T4G5LLqQ-Einw=&attname=%E7%AC%AC1%E7%AB%A0%20%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F%E6%A6%82%E8%BF%B0%20(2).pdf\", \"name\": \"第1章 嵌入式系统概述 (2).pdf\", \"type\": \"file\"}]','normal','public','2025-05-07 15:14:08','2025-05-08 02:37:58'),(28,4,'如何学习xxx','[]','help','public','2025-05-14 00:57:29','2025-05-14 00:57:29'),(29,4,'颠三倒四','[]','normal','private','2025-05-15 08:41:49','2025-05-15 08:43:12');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exercise_set_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('single','multiple') COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` json NOT NULL,
  `answer` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `exercise_set_id` (`exercise_set_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exercise_set_id`) REFERENCES `exercise_sets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'React 是什么？','single','[\"JavaScript库\", \"编程语言\", \"操作系统\", \"数据库\"]','[\"JavaScript库\"]','2025-05-02 03:01:59','2025-05-02 03:01:59'),(2,1,'React的核心特性包括哪些？','multiple','[\"组件化\", \"虚拟DOM\", \"单向数据流\", \"JSX语法\"]','[\"组件化\", \"虚拟DOM\", \"单向数据流\", \"JSX语法\"]','2025-05-02 03:01:59','2025-05-02 03:01:59'),(3,2,'Vue.js的核心是什么？','single','[\"数据驱动\", \"组件化\", \"路由系统\", \"状态管理\"]','[\"数据驱动\"]','2025-05-02 03:01:59','2025-05-02 03:01:59'),(4,2,'Vue.js 2.x的特性有哪些？','multiple','[\"响应式系统\", \"虚拟DOM\", \"组件化\", \"模板语法\"]','[\"响应式系统\", \"虚拟DOM\", \"组件化\", \"模板语法\"]','2025-05-02 03:01:59','2025-05-02 03:01:59'),(8,3,'JavaScript中的闭包是什么？','single','[\"函数和其环境的组合\", \"对象的一种\", \"一种数据类型\", \"一种循环结构\"]','[\"函数和其环境的组合\"]','2025-05-10 15:37:29','2025-05-10 15:37:29'),(9,3,'JavaScript中实现继承的方式有哪些？','multiple','[\"原型继承\", \"构造函数继承\", \"组合继承\", \"ES6 class继承\"]','[\"原型继承\", \"构造函数继承\", \"组合继承\", \"ES6 class继承\"]','2025-05-10 15:37:34','2025-05-10 15:37:34'),(10,7,'微信小程序的生命周期函数有哪些？','multiple','[\"onLoad\", \"onShow\", \"onReady\", \"onHide\", \"onUnload\"]','[\"onLoad\", \"onShow\", \"onReady\", \"onHide\", \"onUnload\"]','2025-05-10 15:37:39','2025-05-10 15:37:39'),(11,4,'Python中哪些库常用于数据分析？','multiple','[\"NumPy\", \"Pandas\", \"Matplotlib\", \"Scikit-learn\", \"TensorFlow\"]','[\"NumPy\", \"Pandas\", \"Matplotlib\", \"Scikit-learn\"]','2025-05-10 15:37:45','2025-05-10 15:37:45'),(12,3,'JavaScript中的Promise主要用来解决什么问题？','single','[\"异步编程的回调地狱\", \"变量作用域问题\", \"内存泄漏\", \"浏览器兼容性\"]','[\"异步编程的回调地狱\"]','2025-05-10 15:41:00','2025-05-10 15:41:00'),(13,3,'以下哪个不属于JavaScript的数据类型？','single','[\"String\", \"Boolean\", \"Float\", \"Object\", \"Number\"]','[\"Float\"]','2025-05-10 15:41:05','2025-05-10 15:41:05'),(14,3,'ES6中新增的特性有哪些？','multiple','[\"let和const\", \"箭头函数\", \"Promise\", \"async/await\", \"解构赋值\"]','[\"let和const\", \"箭头函数\", \"Promise\", \"解构赋值\"]','2025-05-10 15:41:10','2025-05-10 15:41:10'),(15,4,'Pandas中用于数据清洗的主要方法是？','multiple','[\"dropna()\", \"fillna()\", \"replace()\", \"interpolate()\"]','[\"dropna()\", \"fillna()\", \"replace()\"]','2025-05-10 15:41:19','2025-05-10 15:41:19'),(16,4,'NumPy中的ndarray与Python的list相比有什么优势？','multiple','[\"内存使用效率更高\", \"支持矢量化运算\", \"支持广播机制\", \"数据类型一致性\"]','[\"内存使用效率更高\", \"支持矢量化运算\", \"支持广播机制\", \"数据类型一致性\"]','2025-05-10 15:41:25','2025-05-10 15:41:25'),(17,4,'Matplotlib主要用于哪方面工作？','single','[\"数据可视化\", \"数据清洗\", \"机器学习\", \"Web开发\"]','[\"数据可视化\"]','2025-05-10 15:41:31','2025-05-10 15:41:31'),(18,4,'Python中哪个库适合进行高级统计分析？','single','[\"SciPy\", \"NumPy\", \"TensorFlow\", \"Flask\"]','[\"SciPy\"]','2025-05-10 15:41:36','2025-05-10 15:41:36'),(19,5,'Java中的接口和抽象类的主要区别是什么？','multiple','[\"接口只能有抽象方法，抽象类可以有非抽象方法\", \"一个类可以实现多个接口，但只能继承一个抽象类\", \"接口中的变量默认是final的\", \"抽象类可以有构造方法\"]','[\"接口只能有抽象方法，抽象类可以有非抽象方法\", \"一个类可以实现多个接口，但只能继承一个抽象类\", \"接口中的变量默认是final的\", \"抽象类可以有构造方法\"]','2025-05-10 15:41:43','2025-05-10 15:41:43'),(20,5,'Java中的集合框架包括哪些主要接口？','multiple','[\"List\", \"Set\", \"Map\", \"Queue\"]','[\"List\", \"Set\", \"Map\", \"Queue\"]','2025-05-10 15:41:48','2025-05-10 15:41:48'),(21,5,'Java中的垃圾回收主要处理什么类型的内存？','single','[\"堆内存\", \"栈内存\", \"寄存器\", \"程序计数器\"]','[\"堆内存\"]','2025-05-10 15:41:53','2025-05-10 15:41:53'),(22,5,'Java 8引入的新特性有哪些？','multiple','[\"Lambda表达式\", \"Stream API\", \"接口默认方法\", \"Optional类\", \"新的日期和时间API\"]','[\"Lambda表达式\", \"Stream API\", \"接口默认方法\", \"Optional类\", \"新的日期和时间API\"]','2025-05-10 15:42:05','2025-05-10 15:42:05'),(23,5,'Java中的线程安全集合类有哪些？','multiple','[\"Vector\", \"Hashtable\", \"ConcurrentHashMap\", \"ArrayList\"]','[\"Vector\", \"Hashtable\", \"ConcurrentHashMap\"]','2025-05-10 15:42:14','2025-05-10 15:42:14'),(24,7,'微信小程序的文件类型包括哪些？','multiple','[\"wxml\", \"wxss\", \"js\", \"json\"]','[\"wxml\", \"wxss\", \"js\", \"json\"]','2025-05-10 15:42:27','2025-05-10 15:42:27'),(25,7,'微信小程序的数据绑定使用什么语法？','single','[\"双大括号语法：{{变量}}\", \"单大括号语法：{变量}\", \"美元符语法：\", \"百分号语法：%{变量}\"]','[\"双大括号语法：{{变量}}\"]','2025-05-10 15:42:33','2025-05-10 15:42:33'),(26,7,'小程序中如何进行页面跳转？','multiple','[\"wx.navigateTo\", \"wx.redirectTo\", \"wx.switchTab\", \"wx.navigateBack\"]','[\"wx.navigateTo\", \"wx.redirectTo\", \"wx.switchTab\", \"wx.navigateBack\"]','2025-05-10 15:42:38','2025-05-10 15:42:38'),(27,7,'小程序的全局配置文件是？','single','[\"app.json\", \"app.js\", \"app.wxss\", \"project.config.json\"]','[\"app.json\"]','2025-05-10 15:42:45','2025-05-10 15:42:45'),(28,6,'C++中链表的优势是什么？','multiple','[\"动态内存分配\", \"插入和删除操作高效\", \"不需要连续的内存空间\", \"随机访问元素\"]','[\"动态内存分配\", \"插入和删除操作高效\", \"不需要连续的内存空间\"]','2025-05-10 15:42:54','2025-05-10 15:42:54'),(29,6,'二叉搜索树的特点是什么？','multiple','[\"左子树所有节点值小于根节点\", \"右子树所有节点值大于根节点\", \"平衡树的一种\", \"支持快速查找\"]','[\"左子树所有节点值小于根节点\", \"右子树所有节点值大于根节点\", \"支持快速查找\"]','2025-05-10 15:43:02','2025-05-10 15:43:02');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (1,1,'完成web大作业','4.19 | 14:00-16:00','完成web大作业','2025-05-02 03:01:59','2025-05-02 03:01:59'),(2,1,'准备期末考试','4.19 | 19:00-21:00','准备期末考试','2025-05-02 03:01:59','2025-05-02 03:01:59'),(3,4,'计划标题','2025/05/23 10:00:00 - 2025/05/23 20:00:00','计划详情','2025-05-10 03:14:23','2025-05-10 03:14:23');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_messages`
--

DROP TABLE IF EXISTS `system_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  CONSTRAINT `system_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_messages`
--

LOCK TABLES `system_messages` WRITE;
/*!40000 ALTER TABLE `system_messages` DISABLE KEYS */;
INSERT INTO `system_messages` VALUES (1,4,'微信用户加入了群聊','2025-05-11 10:18:13'),(2,22,'微信用户退出了群聊','2025-05-11 11:50:09'),(3,24,'微信用户退出了群聊','2025-05-11 11:50:21'),(4,22,'微信用户加入了群聊','2025-05-12 04:32:05'),(5,22,'微信用户退出了群聊','2025-05-12 04:32:21'),(6,22,'微信用户加入了群聊','2025-05-14 00:59:49');
/*!40000 ALTER TABLE `system_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag_count`
--

DROP TABLE IF EXISTS `tag_count`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag_count` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tag_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `count` int DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_tag` (`user_id`,`tag_name`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag_count`
--

LOCK TABLES `tag_count` WRITE;
/*!40000 ALTER TABLE `tag_count` DISABLE KEYS */;
INSERT INTO `tag_count` VALUES (1,4,'机器学习',4,'2025-05-19 16:44:11'),(2,4,'Python',4,'2025-05-19 16:44:11'),(3,4,'编程',26,'2025-05-19 16:46:08'),(4,4,'数据结构',2,'2025-05-15 16:43:59'),(5,4,'算法',2,'2025-05-15 16:43:59'),(8,4,'云计算',2,'2025-05-19 16:44:28'),(10,4,'前端开发',1,'2025-05-11 23:48:39'),(12,4,'编程题',9,'2025-05-19 16:45:17'),(13,4,'实战题',1,'2025-05-12 00:26:48'),(15,4,'学习经验',3,'2025-05-19 16:46:08'),(17,4,'学习',3,'2025-05-19 16:46:08'),(18,4,'选择题',4,'2025-05-19 16:45:17'),(25,4,'技术分享',1,'2025-05-14 08:56:10'),(31,4,'学习问题',3,'2025-05-19 16:46:03'),(33,1,'学习问题',1,'2025-05-14 08:58:21'),(34,4,'编程基础',2,'2025-05-19 16:44:40'),(39,4,'其他',2,'2025-05-19 16:46:05'),(48,4,'大数据',1,'2025-05-19 16:44:26'),(57,4,'填空题',1,'2025-05-19 16:44:59'),(61,4,'算法题',1,'2025-05-19 16:45:12');
/*!40000 ALTER TABLE `tag_count` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标签类型，如课程、帖子、通用等',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (10,'编程基础','2025-05-11 15:22:29','course'),(11,'数据结构','2025-05-11 15:22:29','course'),(12,'算法','2025-05-11 15:22:29','course'),(13,'前端开发','2025-05-11 15:22:29','course'),(14,'后端开发','2025-05-11 15:22:29','course'),(15,'数据库','2025-05-11 15:22:29','course'),(16,'人工智能','2025-05-11 15:22:29','course'),(17,'机器学习','2025-05-11 15:22:29','course'),(18,'Python','2025-05-11 15:22:29','course'),(19,'大数据','2025-05-11 15:22:29','course'),(20,'云计算','2025-05-11 15:22:29','course'),(21,'网络安全','2025-05-11 15:22:29','course'),(22,'移动开发','2025-05-11 15:22:29','course'),(23,'软件测试','2025-05-11 15:22:29','course'),(24,'项目管理','2025-05-11 15:22:29','course'),(25,'产品设计','2025-05-11 15:22:29','course'),(26,'区块链','2025-05-11 15:22:29','course'),(27,'选择题','2025-05-11 15:22:29','exercise'),(28,'填空题','2025-05-11 15:22:29','exercise'),(29,'编程题','2025-05-11 15:22:29','exercise'),(30,'算法题','2025-05-11 15:22:29','exercise'),(31,'实战题','2025-05-11 15:22:29','exercise'),(32,'学习经验','2025-05-11 15:22:29','post'),(33,'技术分享','2025-05-11 15:22:29','post'),(34,'问题求助','2025-05-11 15:22:29','post'),(35,'资源共享','2025-05-11 15:22:29','post'),(36,'讨论交流','2025-05-11 15:22:29','post'),(37,'编程','2025-05-11 15:22:29','common'),(38,'学习','2025-05-11 15:22:29','common'),(39,'求助','2025-05-11 15:22:29','common'),(40,'其他','2025-05-11 15:22:29','common'),(41,'学习问题','2025-05-14 00:57:29',NULL);
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_similarity`
--

DROP TABLE IF EXISTS `user_similarity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_similarity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_a` int NOT NULL,
  `user_b` int NOT NULL,
  `similarity` float NOT NULL,
  `taglist` text COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_pair` (`user_a`,`user_b`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_similarity`
--

LOCK TABLES `user_similarity` WRITE;
/*!40000 ALTER TABLE `user_similarity` DISABLE KEYS */;
INSERT INTO `user_similarity` VALUES (1,1,4,0,',,,,,,,,,,,,,','2025-05-14 08:58:17'),(2,4,1,0,'','2025-05-14 08:59:07');
/*!40000 ALTER TABLE `user_similarity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `background_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `extra` json DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'student',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'张三','$2b$10$Uw.E1RhuxdkWtNeE3tJC8uJ8gIF/4LsBY0mnkwIgslcDodK0tna.i','zhangsan@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=1','https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png','热爱学习的学生','{\"age\": 24, \"gender\": 1, \"school\": \"北京大学\", \"birthday\": \"2000-01-01\", \"location\": [\"北京\", \"市辖区\"], \"createTime\": \"2024-01-01 10:00:00\", \"constellation\": \"摩羯座\", \"lastLoginTime\": \"2025-05-14 08:58:15\"}','student','2025-05-02 03:01:59','2025-05-14 00:58:15'),(2,'李四','$2b$10$ZcswQUykLVNZiRmwjg4hDOCXr.aF.fltqTqYIiXNjwDmImJ03tNM.','lisi@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=2','https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png','计算机科学爱好者','{\"age\": 23, \"gender\": 1, \"school\": \"复旦大学\", \"birthday\": \"2001-02-02\", \"location\": [\"上海\", \"市辖区\"], \"createTime\": \"2024-01-02 11:00:00\", \"constellation\": \"水瓶座\", \"lastLoginTime\": \"2024-03-19 16:30:00\"}','student','2025-05-02 03:01:59','2025-05-02 03:01:59'),(3,'王五','$2b$10$tF91Ntj63QeMB6wkapc98ORNCfXfBUPE5v94yfmC5WrVK2erDpIt2','wangwu@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=3','https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png','数学爱好者','{\"age\": 25, \"gender\": 1, \"school\": \"中山大学\", \"birthday\": \"1999-03-03\", \"location\": [\"广东\", \"广州\"], \"createTime\": \"2024-01-03 12:00:00\", \"constellation\": \"双鱼座\", \"lastLoginTime\": \"2024-03-18 17:30:00\"}','student','2025-05-02 03:01:59','2025-05-02 03:01:59'),(4,'微信用户','$2b$10$i2O.Rxe0zReQ72v9TOliZOkkcF3g57DJvv9JPF/x97JyyEi.wYaV6','wechat@example.com','https://api.dicebear.com/7.x/avataaars/svg?seed=4','https://img20.360buyimg.com/openfeedback/jfs/t1/275753/36/25037/149784/68089586Ffe6bf8d7/ae8f30f33cc1694a.png','','{\"age\": \"\", \"gender\": 3, \"school\": \"\", \"birthday\": \"\", \"location\": [], \"createTime\": \"2025-05-04 11:07:12\", \"constellation\": \"\", \"lastLoginTime\": \"2025-05-19 17:12:16\"}','student','2025-05-04 03:07:12','2025-05-19 09:12:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_group_sessions`
--

DROP TABLE IF EXISTS `v_group_sessions`;
/*!50001 DROP VIEW IF EXISTS `v_group_sessions`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_group_sessions` AS SELECT 
 1 AS `id`,
 1 AS `user_id`,
 1 AS `target_id`,
 1 AS `last_message`,
 1 AS `last_time`,
 1 AS `unread_count`,
 1 AS `type`,
 1 AS `group_id`,
 1 AS `name`,
 1 AS `cover_image`,
 1 AS `description`,
 1 AS `creator_id`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `member_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_group_sessions`
--

/*!50001 DROP VIEW IF EXISTS `v_group_sessions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_group_sessions` AS select `cs`.`id` AS `id`,`cs`.`user_id` AS `user_id`,`cs`.`target_id` AS `target_id`,`cs`.`last_message` AS `last_message`,`cs`.`last_time` AS `last_time`,`cs`.`unread_count` AS `unread_count`,`cs`.`type` AS `type`,`cs`.`group_id` AS `group_id`,`cg`.`name` AS `name`,`cg`.`avatar` AS `cover_image`,`cg`.`description` AS `description`,`cg`.`creator_id` AS `creator_id`,`cg`.`created_at` AS `created_at`,`cg`.`updated_at` AS `updated_at`,(select count(0) from `chat_group_members` where (`chat_group_members`.`group_id` = `cg`.`id`)) AS `member_count` from (`chat_sessions` `cs` join `chat_groups` `cg` on((`cs`.`group_id` = `cg`.`id`))) where (`cs`.`type` = 'group') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-23 16:23:02
