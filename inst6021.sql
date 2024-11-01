-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-10-2024 a las 18:18:05
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

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`idalumno`, `dni`, `cuil`, `apellidos`, `nombres`, `fechanac`, `localidad`, `correo`, `clave`, `telefono`, `acuerdo`, `reset_token`, `reset_token_expires`) VALUES
(1, 31840303, '27-31840303-7', 'Alderete', 'Diego Eduardo', '1986-04-04', 'Rio Piedras', 'diegoeduardo66@gmail.com', 'killer', '3876502243', 'Aceptado', 'c8580ceed138be22e3b31c5b89a20407e4b6b699', '2024-10-30 16:11:29'),
(2, 32723694, '27-32723694-0', 'Herrera', 'Irene Del Carmen', '1987-07-11', 'Rio Piedras', '', '', '3876507262', 'Aceptado', '', '2024-10-29 13:05:30'),
(3, 50008803, '20-50008803-3', 'Rojas', 'Damian Federico', '1999-10-22', 'El Galpon', '', '', '3876507262', 'Aceptado', '', '2024-10-29 13:05:30'),
(4, 16806431, '27-16806431-6', 'Torres', 'Maria Teresa', '1968-02-17', 'Rio Piedras', 'titatorres@gmail.com', 'tita123', '3876411544', 'Aceptado', '', '2024-10-29 13:05:30'),
(5, 31840303, '27-31840303-7', 'Alderete', 'Diego', '1999-02-02', 'Rio Piedras', 'diegoeduardo66@gmail.com', 'admin', '3876502243', 'Aceptado', '', '2024-10-29 13:05:30'),
(6, 31840303, '27-31840303-7', 'Alderete', 'Diego', '1986-04-04', 'Rio Piedras', 'diegoeduardo66@gmail.com', 'admin', '3876502243', 'Aceptado', '', '2024-10-29 13:05:30'),
(7, 13894069, '20-13894069-5', 'Alderete', 'Mario Eduardo', '1960-02-12', 'Lumbreras', 'marioealderete@gmail.com', 'admin', '3876441323', 'Aceptado', '', '2024-10-30 10:58:22');

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

--
-- Volcado de datos para la tabla `carrera`
--

INSERT INTO `carrera` (`idcarrera`, `nombre`, `tipo`, `duracion`, `estado`) VALUES
(1, 0, 0, 0, ''),
(2, 0, 0, 0, ''),
(3, 0, 0, 0, ''),
(4, 0, 0, 0, ''),
(5, 0, 0, 0, ''),
(6, 0, 0, 0, ''),
(7, 0, 0, 0, ''),
(8, 0, 0, 0, ''),
(9, 0, 0, 0, ''),
(10, 0, 0, 0, ''),
(11, 1, 0, 0, '4'),
(12, 2, 0, 0, '4'),
(13, 3, 0, 0, '3'),
(14, 4, 0, 0, '3'),
(15, 5, 0, 0, '3'),
(16, 6, 0, 0, '3'),
(17, 7, 0, 0, '4'),
(18, 8, 0, 0, '4'),
(19, 9, 0, 0, '4'),
(20, 0, 0, 0, '');

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
  `estado` varchar(20) NOT NULL
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
  MODIFY `idalumno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `carrera`
--
ALTER TABLE `carrera`
  MODIFY `idcarrera` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `carreras`
--
ALTER TABLE `carreras`
  MODIFY `idcarrera` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
