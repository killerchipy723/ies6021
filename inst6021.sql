-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-10-2024 a las 21:40:03
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
(1, 31840303, '27-31840303-7', 'Alderete', 'Diego Eduardo', '1986-04-04', 'Rio Piedras', 'diegoeduardo66@gmail.com', 'killer', '3876502243', 'Aceptado', '', '2024-10-29 19:30:30'),
(2, 32723694, '27-32723694-0', 'Herrera', 'Irene Del Carmen', '1987-07-11', 'Rio Piedras', '', '', '3876507262', 'Aceptado', '', '2024-10-29 13:05:30'),
(3, 50008803, '20-50008803-3', 'Rojas', 'Damian Federico', '1999-10-22', 'El Galpon', '', '', '3876507262', 'Aceptado', '', '2024-10-29 13:05:30'),
(4, 16806431, '27-16806431-6', 'Torres', 'Maria Teresa', '1968-02-17', 'Rio Piedras', 'titatorres@gmail.com', 'tita123', '3876411544', 'Aceptado', '', '2024-10-29 13:05:30'),
(5, 31840303, '27-31840303-7', 'Alderete', 'Diego', '1999-02-02', 'Rio Piedras', 'diegoeduardo66@gmail.com', 'admin', '3876502243', 'Aceptado', '', '2024-10-29 13:05:30'),
(6, 31840303, '27-31840303-7', 'Alderete', 'Diego', '1986-04-04', 'Rio Piedras', 'diegoeduardo66@gmail.com', 'admin', '3876502243', 'Aceptado', '', '2024-10-29 13:05:30');

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
-- Estructura de tabla para la tabla `preinscripcion`
--

CREATE TABLE `preinscripcion` (
  `idinscripcion` int(11) NOT NULL,
  `idalumno` int(11) NOT NULL,
  `idcarrera` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `estado` varchar(20) NOT NULL
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
-- Indices de la tabla `preinscripcion`
--
ALTER TABLE `preinscripcion`
  ADD PRIMARY KEY (`idinscripcion`),
  ADD KEY `idalumno` (`idalumno`),
  ADD KEY `idcarrera` (`idcarrera`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `idalumno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `carrera`
--
ALTER TABLE `carrera`
  MODIFY `idcarrera` int(11) NOT NULL AUTO_INCREMENT;

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
