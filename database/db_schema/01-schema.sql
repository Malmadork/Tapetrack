-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               12.0.2-MariaDB-ubu2404 - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.12.0.7122
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for tapetrack
CREATE DATABASE IF NOT EXISTS `tapetrack` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `tapetrack`;

-- Dumping structure for table tapetrack.album
CREATE TABLE IF NOT EXISTS `album` (
  `alb_id` int(10) NOT NULL AUTO_INCREMENT,
  `alb_discogs_id` int(10) NOT NULL,
  `alb_name` varchar(255) NOT NULL,
  `alb_artist` varchar(100) NOT NULL,
  `alb_year` int(100) NOT NULL,
  `alb_genre` varchar(255) NOT NULL,
  `alb_numTracks` int(10) DEFAULT NULL,
  `alb_runtime` int(10) DEFAULT NULL,
  `alb_coverart` text NOT NULL,
  PRIMARY KEY (`alb_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.group
CREATE TABLE IF NOT EXISTS `group` (
  `grp_id` int(10) NOT NULL AUTO_INCREMENT,
  `grp_name` varchar(100) NOT NULL,
  `grp_description` varchar(255) DEFAULT NULL,
  `grp_usr_id` int(10) DEFAULT NULL,
  PRIMARY KEY (`grp_id`),
  UNIQUE KEY `grp_name` (`grp_name`),
  KEY `fk_grp_usr_id_idx` (`grp_usr_id`),
  CONSTRAINT `fk_grp_usr_id` FOREIGN KEY (`grp_usr_id`) REFERENCES `user` (`usr_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.group_album
CREATE TABLE IF NOT EXISTS `group_album` (
  `grp_id` int(10) NOT NULL,
  `alb_id` int(10) NOT NULL,
  PRIMARY KEY (`grp_id`,`alb_id`),
  KEY `fk_alb_id_idx` (`alb_id`),
  CONSTRAINT `fk_alb_id` FOREIGN KEY (`alb_id`) REFERENCES `album` (`alb_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_grp_id` FOREIGN KEY (`grp_id`) REFERENCES `group` (`grp_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.group_user
CREATE TABLE IF NOT EXISTS `group_user` (
  `grp_id` int(10) NOT NULL,
  `usr_id` int(10) NOT NULL,
  PRIMARY KEY (`grp_id`,`usr_id`),
  KEY `fk_usr_id_idx` (`usr_id`),
  CONSTRAINT `fk_member_grp_id` FOREIGN KEY (`grp_id`) REFERENCES `group` (`grp_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_member_usr_id` FOREIGN KEY (`usr_id`) REFERENCES `user` (`usr_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.list
CREATE TABLE IF NOT EXISTS `list` (
  `list_id` int(10) NOT NULL AUTO_INCREMENT,
  `list_name` varchar(100) NOT NULL,
  `usr_id` int(10) NOT NULL,
  `datetime` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`list_id`),
  KEY `usr_id_idx` (`usr_id`),
  CONSTRAINT `fk_list_usr_id` FOREIGN KEY (`usr_id`) REFERENCES `user` (`usr_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.list_album
CREATE TABLE IF NOT EXISTS `list_album` (
  `list_id` int(10) NOT NULL,
  `alb_id` int(10) NOT NULL,
  `datetime` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`list_id`,`alb_id`),
  KEY `fk_alb_id_idx` (`alb_id`),
  CONSTRAINT `fk_alb_list_id` FOREIGN KEY (`alb_id`) REFERENCES `album` (`alb_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_list_alb_id` FOREIGN KEY (`list_id`) REFERENCES `list` (`list_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.message
CREATE TABLE IF NOT EXISTS `message` (
  `msg_id` int(10) NOT NULL AUTO_INCREMENT,
  `msg_grp_id` int(10) NOT NULL,
  `msg_content` varchar(255) NOT NULL,
  `datetime` timestamp NULL DEFAULT current_timestamp(),
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`msg_id`),
  KEY `fk_msg_grp_id_idx` (`msg_grp_id`),
  KEY `fk_msg_usr_username_idx` (`username`),
  CONSTRAINT `fk_msg_grp_id` FOREIGN KEY (`msg_grp_id`) REFERENCES `group` (`grp_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_msg_usr_username` FOREIGN KEY (`username`) REFERENCES `user` (`usr_username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.review
CREATE TABLE IF NOT EXISTS `review` (
  `rev_id` int(10) NOT NULL AUTO_INCREMENT,
  `alb_id` int(10) NOT NULL,
  `usr_id` int(10) NOT NULL,
  `score` double NOT NULL,
  `review` varchar(255) DEFAULT NULL,
  `trk_id` int(10) DEFAULT NULL,
  `datetime` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`rev_id`),
  UNIQUE KEY `unique_user_album` (`usr_id`,`alb_id`),
  KEY `fk_rev_alb_id_idx` (`alb_id`),
  KEY `fk_rev_usr_id_idx` (`usr_id`),
  KEY `fk_rev_trk_id_idx` (`trk_id`),
  CONSTRAINT `fk_rev_alb_id` FOREIGN KEY (`alb_id`) REFERENCES `album` (`alb_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rev_trk_id` FOREIGN KEY (`trk_id`) REFERENCES `track` (`trk_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rev_usr_id` FOREIGN KEY (`usr_id`) REFERENCES `user` (`usr_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.track
CREATE TABLE IF NOT EXISTS `track` (
  `trk_id` int(10) NOT NULL AUTO_INCREMENT,
  `alb_id` int(10) NOT NULL,
  `trk_name` varchar(100) NOT NULL,
  `trk_position` varchar(100) NOT NULL,
  `trk_duration` varchar(50) NOT NULL,
  PRIMARY KEY (`trk_id`),
  KEY `alb_id_idx` (`alb_id`),
  CONSTRAINT `alb_id` FOREIGN KEY (`alb_id`) REFERENCES `album` (`alb_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table tapetrack.user
CREATE TABLE IF NOT EXISTS `user` (
  `usr_id` int(11) NOT NULL AUTO_INCREMENT,
  `usr_username` varchar(150) NOT NULL,
  `usr_password` varchar(255) NOT NULL,
  `usr_salt` varchar(100) NOT NULL,
  `usr_push` tinyint(1) DEFAULT 1,
  `usr_cache` tinyint(1) DEFAULT 1,
  `usr_visibility` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`usr_id`),
  UNIQUE KEY `usr_username` (`usr_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
