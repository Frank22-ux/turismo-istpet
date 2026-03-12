-- ==========================================================
-- SCRIPT: DB_Turismo_C.sql
-- SISTEMA: ECRUT Travels (Versión Final Estabilizada)
-- MOTOR: PostgreSQL 18
-- ==========================================================

-- Limpieza inicial para asegurar una instalación limpia
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS hotel_habitaciones CASCADE;
DROP TABLE IF EXISTS seguimiento_guia CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS guias_detalles CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS hoteles CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. TABLA: ROLES
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_nombre_rol CHECK (nombre_rol IN ('Administrador', 'Guía', 'Turista'))
);

-- 2. TABLA: USUARIOS (Estructura de Persona Obligatoria)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    -- Nombres y Apellidos (Regla de Negocio)
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50),
    
    -- Identificación única
    cedula VARCHAR(20) NOT NULL UNIQUE,
    
    -- Contacto
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    codigo_pais VARCHAR(5) NOT NULL,
    numero_celular VARCHAR(15) NOT NULL,
    
    -- Perfil
    descripcion_perfil TEXT,
    foto_url VARCHAR(500),
    portada_url VARCHAR(500),
    
    -- Sistema
    id_rol INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- 3. TABLA: PASSWORD_RESET_TOKENS
CREATE TABLE password_reset_tokens (
    id_reset SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_reset_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 4. TABLA: HOTELES
CREATE TABLE hoteles (
    id_hotel SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    estrellas INTEGER DEFAULT 3,
    habitaciones_disponibles INTEGER DEFAULT 10,
    precio_noche DECIMAL(10, 2),
    amenidades TEXT, -- WiFi, Piscina, etc.
    descripcion TEXT,
    fotos_galeria JSONB, -- [url1, url2...]
    convenio_pdf_url VARCHAR(500),
    estado_convenio VARCHAR(20) DEFAULT 'Activo',
    hora_entrada TIME,           -- Hora de check-in
    hora_salida TIME,            -- Hora de check-out
    telefono VARCHAR(20),        -- Número de contacto del hotel
    correo_electronico VARCHAR(150) -- Email de contacto del hotel
);

-- 5. TABLA: CATEGORIAS
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    icono_name VARCHAR(50), -- Nombre del icono de react-icons
    descripcion TEXT
);

-- 6. TABLA: TOURS
CREATE TABLE tours (
    id_tour SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    duracion VARCHAR(50) DEFAULT '1 día',
    fecha_inicio DATE,
    fecha_fin DATE,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    ciudad_destino VARCHAR(100),
    
    -- Multimedia
    imagen_portada VARCHAR(500),
    galeria JSONB, -- [url1, url2...]
    
    -- Detalles adicionales
    dificultad VARCHAR(50) DEFAULT 'Moderada',
    maximo_personas INTEGER DEFAULT 10,
    idiomas JSONB,
    incluye JSONB,
    puntos_interes JSONB,
    
    -- Ofertas Especiales
    en_oferta BOOLEAN DEFAULT false,
    descuento INTEGER DEFAULT 0,
    
    -- Relaciones
    id_categoria INTEGER,
    id_hotel_base INTEGER,
    id_guia_asignado INTEGER, -- Relación con la tabla usuarios (id_usuario con rol guía)
    
    CONSTRAINT fk_tour_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    CONSTRAINT fk_tour_hotel FOREIGN KEY (id_hotel_base) REFERENCES hoteles(id_hotel),
    CONSTRAINT fk_tour_guia FOREIGN KEY (id_guia_asignado) REFERENCES usuarios(id_usuario)
);

-- 7. TABLA: GUIAS_DETALLES (Información técnica del guía)
CREATE TABLE guias_detalles (
    id_detalle_guia SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    idiomas JSONB, -- ["Español", "Inglés"]
    experiencia_anios INTEGER DEFAULT 0,
    especialidades JSONB, -- ["Aventura", "Cultura"]
    bio TEXT,
    disponibilidad VARCHAR(50), -- Tiempo completo, Flexible
    dias_activos JSONB, -- ["Lunes", "Martes"]
    hora_inicio TIME,
    hora_fin TIME,
    cv_pdf_url VARCHAR(500),
    id_hotel_asignado INTEGER,
    
    CONSTRAINT fk_guia_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_guia_hotel FOREIGN KEY (id_hotel_asignado) REFERENCES hoteles(id_hotel)
);

-- 8. TABLA: RESERVAS
CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_turista INTEGER NOT NULL,
    id_tour INTEGER,
    id_hotel INTEGER,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actividad DATE NOT NULL,
    cantidad_personas INTEGER DEFAULT 1,
    total_pagado DECIMAL(10, 2),
    estado_reserva VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, Confirmada, Cancelada
    
    CONSTRAINT fk_reserva_turista FOREIGN KEY (id_turista) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_reserva_tour FOREIGN KEY (id_tour) REFERENCES tours(id_tour),
    CONSTRAINT fk_reserva_hotel FOREIGN KEY (id_hotel) REFERENCES hoteles(id_hotel),
    CONSTRAINT chk_tour_or_hotel CHECK (id_tour IS NOT NULL OR id_hotel IS NOT NULL)
);

-- 9. TABLA: PAGOS
CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL UNIQUE,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'PayPal',
    referencia_txn VARCHAR(100), -- ID de PayPal o número de transferencia
    estado_pago VARCHAR(50), -- COMPLETED, PENDING, DENIED
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)
);

-- 10. TABLA: FAVORITOS
CREATE TABLE favoritos (
    id_favorito SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_tour INTEGER,
    id_hotel INTEGER,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorito_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_favorito_tour FOREIGN KEY (id_tour) REFERENCES tours(id_tour) ON DELETE CASCADE,
    CONSTRAINT fk_favorito_hotel FOREIGN KEY (id_hotel) REFERENCES hoteles(id_hotel) ON DELETE CASCADE,
    CONSTRAINT uq_usuario_tour UNIQUE (id_usuario, id_tour),
    CONSTRAINT uq_usuario_hotel UNIQUE (id_usuario, id_hotel)
);

-- ==========================================================
-- DATOS INICIALES (SEMILLAS)
-- ==========================================================

INSERT INTO roles (nombre_rol) VALUES ('Administrador'), ('Guía'), ('Turista');

INSERT INTO categorias (nombre_categoria, icono_name) VALUES 
('Aventura', 'FaHiking'), 
('Naturaleza', 'FaLeaf'), 
('Playa', 'FaUmbrellaBeach'), 
('Cultura', 'FaMuseum'), 
('Gastronomía', 'FaUtensils'), 
('Lujo', 'FaCrown');

-- Admin de prueba inicial (Password: Admin123!)
INSERT INTO usuarios (primer_nombre, apellido_paterno, cedula, correo, password, codigo_pais, numero_celular, id_rol) 
VALUES ('Super', 'Administrador', '1700000001', 'admin@ecrut.travel', '$2b$10$Xm7vIubR9UuT7m/C6Zt7.uUXkH/f9X1L2LzBw7q1RUp7O8yB9q5y2', '+593', '0999999999', 1);

-- Guía de prueba (Nombre: Jorge, pero que aparezca como tal en el sistema)
INSERT INTO usuarios (primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, cedula, correo, password, codigo_pais, numero_celular, id_rol) 
VALUES ('Jorge', 'Andrés', 'Guzmán', 'Mendoza', '1700000002', 'jorge.guia@ecrut.travel', '$2b$10$Xm7vIubR9UuT7m/C6Zt7.uUXkH/f9X1L2LzBw7q1RUp7O8yB9q5y2', '+593', '0988888888', 2);

-- Turista de prueba (El usuario logueado actualmente)
INSERT INTO usuarios (primer_nombre, apellido_paterno, cedula, correo, password, codigo_pais, numero_celular, id_rol) 
VALUES ('Cristian', 'Traveler', '1700000003', 'cristian@turista.com', '$2b$10$Xm7vIubR9UuT7m/C6Zt7.uUXkH/f9X1L2LzBw7q1RUp7O8yB9q5y2', '+593', '0977777777', 3);

-- 11. TABLA: HOTEL_HABITACIONES
CREATE TABLE hotel_habitaciones (
    id_habitacion SERIAL PRIMARY KEY,
    id_hotel INTEGER NOT NULL REFERENCES hoteles(id_hotel) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio DECIMAL(10, 2) NOT NULL
);

-- 12. TABLA: NOTIFICACIONES
CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario_destino INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    tipo VARCHAR(50), 
    id_referencia INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario_destino) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 13. TABLAS DE RESEÑAS
CREATE TABLE resenas_tours (
    id_resena SERIAL PRIMARY KEY,
    id_tour INT REFERENCES tours(id_tour) ON DELETE CASCADE,
    id_turista INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5) NOT NULL,
    comentario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resenas_guias (
    id_resena SERIAL PRIMARY KEY,
    id_guia INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_turista INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resenas_hoteles (
    id_resena SERIAL PRIMARY KEY,
    id_hotel INTEGER NOT NULL REFERENCES hoteles(id_hotel) ON DELETE CASCADE,
    id_turista INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
