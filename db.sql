-- ============================================
-- SISTEMA DE GESTIÓN DE TOURS (VERSIÓN 2026 - ACTUALIZADA)
-- ============================================

-- 1. LIMPIEZA
DROP TABLE IF EXISTS usuario_insignias CASCADE;
DROP TABLE IF EXISTS insignias CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS tour_galeria CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS guias CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS hoteles CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 2. TABLA: ROLES
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- 3. TABLA: USUARIOS
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50),
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    descripcion_perfil TEXT,
    foto_url VARCHAR(500),
    pais VARCHAR(100),
    ciudad VARCHAR(100),
    idiomas VARCHAR(255),
    nivel_experiencia VARCHAR(50) DEFAULT 'principiante',
    preferencias JSONB DEFAULT '{}'::jsonb,
    id_rol INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    viajes_completados INTEGER DEFAULT 0,
    paises_visitados INTEGER DEFAULT 0,
    resenas INTEGER DEFAULT 0,
    insignias INTEGER DEFAULT 0,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- 4. TABLA: HOTELES
CREATE TABLE hoteles (
    id_hotel SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    estrellas INTEGER DEFAULT 3, 
    habitaciones INTEGER DEFAULT 0,
    estado_convenio VARCHAR(20) DEFAULT 'Disponible',
    descripcion TEXT,
    foto_url VARCHAR(500),
    galeria TEXT[],
    telefono VARCHAR(20)
);

-- 5. TABLA: CATEGORIAS
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 6. TABLA: GUIAS
CREATE TABLE guias (
    id_guia SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    id_hotel_asignado INTEGER, 
    especialidad VARCHAR(200),
    bio TEXT,
    CONSTRAINT fk_guia_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_guia_hotel FOREIGN KEY (id_hotel_asignado) REFERENCES hoteles(id_hotel) ON DELETE SET NULL
);

-- 7. TABLA: TOURS (ACTUALIZADA CON NUEVOS CAMPOS)
CREATE TABLE tours (
    id_tour SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    -- Precios diferenciados
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,          -- Precio Adulto
    precio_nino DECIMAL(10, 2) NOT NULL DEFAULT 0.00,     -- Precio Niño
    precio_especial DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Precio Discapacitados/3ra Edad
    
    duracion VARCHAR(50) NOT NULL, 
    ciudad_destino VARCHAR(100),
    direccion VARCHAR(255),                               -- Dirección detectada por mapa
    fecha_inicio DATE,
    fecha_fin DATE,
    latitud DECIMAL(10, 8) DEFAULT 0,
    longitud DECIMAL(11, 8) DEFAULT 0,
    imagen_portada VARCHAR(255),
    galeria TEXT[], 
    id_categoria INTEGER, 
    id_hotel_base INTEGER,
    id_guia INTEGER,
    estado VARCHAR(20) DEFAULT 'Activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tour_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL,
    CONSTRAINT fk_tour_hotel FOREIGN KEY (id_hotel_base) REFERENCES hoteles(id_hotel) ON DELETE SET NULL,
    CONSTRAINT fk_tour_guia FOREIGN KEY (id_guia) REFERENCES guias(id_guia) ON DELETE SET NULL
);

-- 8. TABLA: TOUR_GALERIA
CREATE TABLE tour_galeria (
    id_imagen SERIAL PRIMARY KEY,
    id_tour INTEGER NOT NULL,
    url_imagen VARCHAR(500) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_galeria_tour FOREIGN KEY (id_tour) REFERENCES tours(id_tour) ON DELETE CASCADE
);

-- 9. TABLA: RESERVAS (Ajustada para soportar desglose de personas)
CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_turista INTEGER NOT NULL,
    id_tour INTEGER NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actividad DATE NOT NULL,
    -- Desglose opcional por tipos
    cant_adultos INTEGER DEFAULT 1,
    cant_ninos INTEGER DEFAULT 0,
    cant_especial INTEGER DEFAULT 0,
    total DECIMAL(10, 2), 
    estado_reserva VARCHAR(20) DEFAULT 'Pendiente', 
    CONSTRAINT fk_reserva_turista FOREIGN KEY (id_turista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_tour FOREIGN KEY (id_tour) REFERENCES tours(id_tour) ON DELETE CASCADE
);

-- 10. TABLA: PAGOS
CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL UNIQUE,
    monto DECIMAL(10, 2) NOT NULL,
    metodo VARCHAR(50) DEFAULT 'PayPal', 
    referencia_transaccion VARCHAR(100),
    estado_paypal VARCHAR(50), 
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE CASCADE
);

-- 11. TABLA: INSIGNIAS
CREATE TABLE insignias (
    id_insignia SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    icono_url VARCHAR(255)
);

-- 12. TABLA: USUARIO_INSIGNIAS
CREATE TABLE usuario_insignias (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_insignia INTEGER NOT NULL,
    asignado_por INTEGER,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ui_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_ui_insignia FOREIGN KEY (id_insignia) REFERENCES insignias(id_insignia) ON DELETE CASCADE
);

-- ============================================
-- INSERCIÓN DE DATOS INICIALES
-- ============================================
INSERT INTO roles (nombre_rol) VALUES ('Administrador'), ('Guía'), ('Turista');
INSERT INTO categorias (nombre_categoria) VALUES ('Aventura'), ('Relax'), ('Cultural');

INSERT INTO hoteles (nombre, direccion, ciudad, estrellas, estado_convenio) VALUES 
('Hotel Paraíso Real', 'Av. Amazonas 123', 'Quito', 5, 'Disponible'),
('Hostal La Montaña', 'Calle Larga 456', 'Cuenca', 3, 'Disponible'),
('Resort Blue Ocean', 'Via Barbasquillo', 'Manta', 4, 'Disponible');

INSERT INTO usuarios (primer_nombre, apellido_paterno, correo, password, id_rol, descripcion_perfil) 
VALUES ('Super', 'Admin', 'admin@toursystem.com', '$2b$10$76YVfH.fB3XG.X/y5jXpY.e.X7vO.aD/P.g0X.j/P.g0X.j/P.g0X', 1, 'Cuenta administradora');

INSERT INTO insignias (nombre, descripcion, icono_url) VALUES
('Primer Viaje', 'Otorgada al completar la primera reserva y viaje', '/icons/medal.svg'),
('Explorador', 'Explora 5 destinos distintos', '/icons/globe.svg');