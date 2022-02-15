-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: emm80z.duckdns.org    Database: esportcom_db
-- ------------------------------------------------------
-- Server version	8.0.28-0ubuntu0.20.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bitacora_equipo`
--

DROP TABLE IF EXISTS `bitacora_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_equipo` (
  `id_bitacora_equipo` int NOT NULL AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_modificacion` datetime NOT NULL,
  `desc_modificacion` varchar(200) NOT NULL,
  PRIMARY KEY (`id_bitacora_equipo`),
  KEY `id_equipo3_idx` (`id_equipo`),
  KEY `id_usuario3_idx` (`id_usuario`),
  CONSTRAINT `id_equipo3` FOREIGN KEY (`id_equipo`) REFERENCES `equipos` (`id_equipo`),
  CONSTRAINT `id_usuario3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bitacora_torneo`
--

DROP TABLE IF EXISTS `bitacora_torneo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_torneo` (
  `id_bitacora_torneo` int NOT NULL AUTO_INCREMENT,
  `id_torneo` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_modificacion` datetime NOT NULL,
  `desc_modificacion` varchar(1000) NOT NULL,
  PRIMARY KEY (`id_bitacora_torneo`),
  KEY `id_torneo4_idx` (`id_torneo`),
  KEY `id_usuario4_idx` (`id_usuario`),
  CONSTRAINT `id_torneo4` FOREIGN KEY (`id_torneo`) REFERENCES `torneos` (`id_torneo`),
  CONSTRAINT `id_usuario4` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enfrentamiento_TFT`
--

DROP TABLE IF EXISTS `enfrentamiento_TFT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enfrentamiento_TFT` (
  `idenfrentamiento_TFT` int NOT NULL AUTO_INCREMENT,
  `id_riot_match` varchar(50) DEFAULT NULL,
  `fecha_jugada` datetime NOT NULL,
  `id_torneo` int NOT NULL,
  PRIMARY KEY (`idenfrentamiento_TFT`),
  KEY `id_torneo5_idx` (`id_torneo`),
  CONSTRAINT `id_torneo5` FOREIGN KEY (`id_torneo`) REFERENCES `torneos` (`id_torneo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipo_torneo`
--

DROP TABLE IF EXISTS `equipo_torneo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipo_torneo` (
  `id_equipo_torneo` int NOT NULL AUTO_INCREMENT,
  `id_equipo` int NOT NULL,
  `id_torneo` int NOT NULL,
  `estado` tinyint NOT NULL,
  `no_equipo` int NOT NULL,
  `posicion` int DEFAULT NULL,
  PRIMARY KEY (`id_equipo_torneo`),
  KEY `id_equipo_idx` (`id_equipo`),
  KEY `id_torneo_idx` (`id_torneo`),
  CONSTRAINT `id_equipo1` FOREIGN KEY (`id_equipo`) REFERENCES `equipos` (`id_equipo`),
  CONSTRAINT `id_torneo1` FOREIGN KEY (`id_torneo`) REFERENCES `torneos` (`id_torneo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `id_equipo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `logo` varchar(256) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `codigo_equipo` varchar(20) NOT NULL,
  PRIMARY KEY (`id_equipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `partida_LOL`
--

DROP TABLE IF EXISTS `partida_LOL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partida_LOL` (
  `id_partida` int NOT NULL AUTO_INCREMENT,
  `id_equipo1` int NOT NULL,
  `id_equipo2` int NOT NULL,
  `id_torneo` int NOT NULL,
  `id_ganador` int DEFAULT NULL,
  `etapa` varchar(45) NOT NULL,
  `fecha_jugada` datetime NOT NULL,
  PRIMARY KEY (`id_partida`),
  KEY `id_equipo16_idx` (`id_equipo1`),
  KEY `id_equipo27_idx` (`id_equipo2`),
  KEY `id_torneo8_idx` (`id_torneo`),
  CONSTRAINT `id_equipo16` FOREIGN KEY (`id_equipo1`) REFERENCES `equipos` (`id_equipo`),
  CONSTRAINT `id_equipo27` FOREIGN KEY (`id_equipo2`) REFERENCES `equipos` (`id_equipo`),
  CONSTRAINT `id_torneo8` FOREIGN KEY (`id_torneo`) REFERENCES `torneos` (`id_torneo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `torneo_estado`
--

DROP TABLE IF EXISTS `torneo_estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneo_estado` (
  `id_estado` int NOT NULL,
  `nombre_estado` varchar(45) NOT NULL,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `torneo_etapa`
--

DROP TABLE IF EXISTS `torneo_etapa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneo_etapa` (
  `id_etapa` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_etapa`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `torneo_juego`
--

DROP TABLE IF EXISTS `torneo_juego`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneo_juego` (
  `id_juego` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id_juego`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `torneos`
--

DROP TABLE IF EXISTS `torneos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneos` (
  `id_torneo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `id_juego` int NOT NULL,
  `no_equipos` int DEFAULT NULL,
  `no_enfrentamientos` int DEFAULT NULL,
  `fecha_fin_registro` datetime NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `id_estado` int NOT NULL,
  `premio` tinyint NOT NULL,
  `desc_premio` varchar(200) DEFAULT NULL,
  `id_etapa_actual` int NOT NULL,
  `privado` tinyint NOT NULL,
  `codigo_torneo` varchar(25) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_torneo`),
  KEY `id_estado_idx` (`id_estado`),
  KEY `id_juego_idx` (`id_juego`),
  KEY `id_etapa_actual_idx` (`id_etapa_actual`),
  CONSTRAINT `id_estado` FOREIGN KEY (`id_estado`) REFERENCES `torneo_estado` (`id_estado`),
  CONSTRAINT `id_etapa_actual` FOREIGN KEY (`id_etapa_actual`) REFERENCES `torneo_etapa` (`id_etapa`),
  CONSTRAINT `id_juego` FOREIGN KEY (`id_juego`) REFERENCES `torneo_juego` (`id_juego`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario_equipo`
--

DROP TABLE IF EXISTS `usuario_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_equipo` (
  `id_usuario_equipo` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_equipo` int NOT NULL,
  `capitan` tinyint DEFAULT NULL,
  PRIMARY KEY (`id_usuario_equipo`),
  KEY `id_usuario_idx` (`id_usuario`),
  KEY `id_equipo_idx` (`id_equipo`),
  CONSTRAINT `id_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipos` (`id_equipo`),
  CONSTRAINT `id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario_torneo_TFT`
--

DROP TABLE IF EXISTS `usuario_torneo_TFT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_torneo_TFT` (
  `id_usuario_torneo_TFT` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_torneo` int NOT NULL,
  `puntaje_jugador` int DEFAULT NULL,
  `no_enfrentamientos_jugados` int DEFAULT NULL,
  `total_damage` int DEFAULT NULL,
  `posicion` int DEFAULT NULL,
  `is_organizador` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_usuario_torneo_TFT`),
  KEY `id_usuario2_idx` (`id_usuario`),
  KEY `id_torneo2_idx` (`id_torneo`),
  CONSTRAINT `id_torneo2` FOREIGN KEY (`id_torneo`) REFERENCES `torneos` (`id_torneo`),
  CONSTRAINT `id_usuario2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(60) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `fecha_registro` datetime DEFAULT NULL,
  `nombre_invocador` varchar(45) DEFAULT NULL,
  `image` varchar(256) DEFAULT NULL,
  `is_active` tinyint NOT NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-11 15:31:24
