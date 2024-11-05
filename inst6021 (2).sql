-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-11-2024 a las 11:48:27
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `inst6021`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno`
--

CREATE TABLE `alumno` (
  `idalumno` int(11) NOT NULL,
  `dni` int(20) NOT NULL,
  `cuil` varchar(16) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `fechanac` date NOT NULL,
  `localidad` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `clave` varchar(100) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `acuerdo` varchar(10) NOT NULL DEFAULT 'Aceptado',
  `reset_token` varchar(200) NOT NULL,
  `reset_token_expires` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrera`
--

CREATE TABLE `carrera` (
  `idcarrera` int(11) NOT NULL,
  `nombre` int(11) NOT NULL,
  `tipo` int(11) NOT NULL,
  `duracion` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carreras`
--

CREATE TABLE `carreras` (
  `idcarrera` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `duracion` int(11) NOT NULL,
  `estado` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carreras`
--

INSERT INTO `carreras` (`idcarrera`, `nombre`, `tipo`, `duracion`, `estado`) VALUES
(1, '﻿PROFESORADO DE EDUCACIÓN SECUNDARIA EN INFORMÁTICA', 'PROFESORADO', 4, 'Activo'),
(2, 'PROFESORADO DE EDUCACIÓN SECUNDARIA EN HISTORIA', 'PROFESORADO', 4, 'Activo'),
(3, 'TECNICATURA SUPERIOR EN LABORATORIO', 'TECNICATURA', 3, 'Activo'),
(4, 'TECNICATURA SUPERIOR EN GESTIÓN PÚBLICA', 'TECNICATURA', 3, 'Activo'),
(5, 'TECNICATURA SUPERIOR EN ADMINISTRACION CON ORIENTACION EN INFORMATICA', 'TECNICATURA', 3, 'Activo'),
(6, 'TECNICATURA SUPERIOR EN HIGIENE Y SEGURIDAD EN EL TRABAJO', 'TECNICATURA', 3, 'Activo'),
(7, 'PROFESORADO EN EDUCACIÓN ESPECIAL CON ORIENTACIÓN EN CIEGOS Y DISMINUIDOS VISUALES', 'PROFESORADO', 4, 'Activo'),
(8, 'PROFESORADO DE EDUCACIÓN SECUNDARIA EN BIOLOGÍA', 'PROFESORADO', 4, 'Activo'),
(9, 'PROFESORADO DE EDUCACIÓN SECUNDARIA EN LENGUA Y LITERATURA', 'PROFESORADO', 4, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preinscripcion`
--

CREATE TABLE `preinscripcion` (
  `idinscripcion` int(11) NOT NULL,
  `idalumno` int(11) NOT NULL,
  `idcarrera` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Preinscripto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('APE0FC-WdcOtgVPwUvX44m2AQ_BH855d', 1730772777, '{\"cookie\":{\"originalMaxAge\":3600000,\"expires\":\"2024-11-05T01:45:45.396Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"idalumno\":1,\"dni\":31840303,\"correo\":\"diegoeduardo66@gmail.com\",\"nombres\":\"DIEGO EDUARDO\",\"apellidos\":\"ALDERETE\"}}'),
('t14iom9nntXQcHxIyaSoO2rVIVyDHSkm', 1730806890, '{\"cookie\":{\"originalMaxAge\":3600000,\"expires\":\"2024-11-05T11:27:30.611Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"idalumno\":1,\"dni\":31840303,\"correo\":\"diegoeduardo66@gmail.com\",\"nombres\":\"DIEGO EDUARDO\",\"apellidos\":\"ALDERETE\"}}');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`idalumno`);

--
-- Indices de la tabla `carrera`
--
ALTER TABLE `carrera`
  ADD PRIMARY KEY (`idcarrera`);

--
-- Indices de la tabla `carreras`
--
ALTER TABLE `carreras`
  ADD PRIMARY KEY (`idcarrera`);

--
-- Indices de la tabla `preinscripcion`
--
ALTER TABLE `preinscripcion`
  ADD PRIMARY KEY (`idinscripcion`),
  ADD KEY `idalumno` (`idalumno`),
  ADD KEY `idcarrera` (`idcarrera`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `idalumno` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `carrera`
--
ALTER TABLE `carrera`
  MODIFY `idcarrera` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `carreras`
--
ALTER TABLE `carreras`
  MODIFY `idcarrera` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `preinscripcion`
--
ALTER TABLE `preinscripcion`
  MODIFY `idinscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `preinscripcion`
--
ALTER TABLE `preinscripcion`
  ADD CONSTRAINT `preinscripcion_ibfk_1` FOREIGN KEY (`idalumno`) REFERENCES `alumno` (`idalumno`),
  ADD CONSTRAINT `preinscripcion_ibfk_2` FOREIGN KEY (`idcarrera`) REFERENCES `carrera` (`idcarrera`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
