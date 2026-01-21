-- ============================================
-- SISTEMA DE GESTIÓN DE TOURS (VERSIÓN 2.0)
-- Cambios: Categorías, Lógica Hotel/Días, PayPal
-- ============================================

-- Limpieza inicial
DROP TABLE IF EXISTS seguimiento_guia CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS guias CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS categorias CASCADE; -- Antes sensaciones
DROP TABLE IF EXISTS hoteles CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================
-- 1. TABLA: ROLES
-- ============================================
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_nombre_rol CHECK (nombre_rol IN ('Administrador', 'Guía', 'Turista'))
);

-- ============================================
-- 2. TABLA: USUARIOS
-- ============================================
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
    id_rol INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- ============================================
-- 3. TABLA: HOTELES
-- ============================================
CREATE TABLE hoteles (
    id_hotel SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    estado_convenio VARCHAR(20) DEFAULT 'Activo',
    descripcion TEXT
);

-- ============================================
-- 4. TABLA: CATEGORIAS (Antes Sensaciones)
-- ============================================
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    icono_url VARCHAR(255),
    descripcion TEXT
);

-- ============================================
-- 5. TABLA: TOURS
-- Lógica aplicada: id_hotel_base puede ser NULL si es de 1 día
-- ============================================
CREATE TABLE tours (
    id_tour SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    
    -- Cambiamos a Días para aplicar tu regla
    duracion_dias INTEGER DEFAULT 1, 
    cupo_maximo INTEGER DEFAULT 20,
    
    -- Relaciones
    id_categoria INTEGER NOT NULL,
    id_hotel_base INTEGER, -- AHORA ES OPCIONAL (NULLABLE)
    
    CONSTRAINT fk_tour_categoria FOREIGN KEY (id_categoria) 
        REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
    CONSTRAINT fk_tour_hotel FOREIGN KEY (id_hotel_base) 
        REFERENCES hoteles(id_hotel) ON DELETE RESTRICT,
    
    CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
    CONSTRAINT chk_duracion_valida CHECK (duracion_dias >= 1)
);

-- ============================================
-- 6. TABLA: GUIAS
-- ============================================
CREATE TABLE guias (
    id_guia SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,
    id_hotel_asignado INTEGER NOT NULL, -- Hotel base del guía
    especialidad VARCHAR(200),
    CONSTRAINT fk_guia_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_guia_hotel FOREIGN KEY (id_hotel_asignado) REFERENCES hoteles(id_hotel)
);

-- ============================================
-- 7. TABLA: RESERVAS
-- ============================================
CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_turista INTEGER NOT NULL,
    id_tour INTEGER NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actividad DATE NOT NULL,
    cantidad_personas INTEGER DEFAULT 1,
    estado_reserva VARCHAR(20) DEFAULT 'Pendiente',
    
    CONSTRAINT fk_reserva_turista FOREIGN KEY (id_turista) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_reserva_tour FOREIGN KEY (id_tour) REFERENCES tours(id_tour)
);

-- ============================================
-- 8. TABLA: PAGOS (Integración PayPal)
-- ============================================
CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL UNIQUE,
    monto DECIMAL(10, 2) NOT NULL,
    
    -- Campos específicos de PayPal
    metodo VARCHAR(50) DEFAULT 'PayPal', 
    referencia_transaccion VARCHAR(100), -- El ID que devuelve la API de PayPal (ej. 9A152...)
    estado_paypal VARCHAR(50), -- COMPLETED, PENDING, DENIED
    
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)
);

-- ============================================
-- 9. TABLA: SEGUIMIENTO_GUIA
-- ============================================
CREATE TABLE seguimiento_guia (
    id_seguimiento SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL,
    id_guia INTEGER NOT NULL,
    estado_animo VARCHAR(100),
    satisfaccion_nivel INTEGER,
    comentarios TEXT,
    fecha_seguimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seguimiento_reserva FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva),
    CONSTRAINT fk_seguimiento_guia FOREIGN KEY (id_guia) REFERENCES guias(id_guia)
);

-- ============================================
-- DATOS DE PRUEBA ACTUALIZADOS
-- ============================================

INSERT INTO roles (nombre_rol) VALUES ('Administrador'), ('Guía'), ('Turista');

INSERT INTO categorias (nombre_categoria) VALUES 
    ('Aventura'), ('Relax'), ('Cultural'), ('Ecoturismo'), ('Gastronómica');

-- Admin de prueba
INSERT INTO usuarios (primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, correo, password, id_rol, descripcion_perfil) 
VALUES ('Super', 'Admin', 'Sistema', 'Principal', 'admin@toursystem.com', 'admin123', 1, 'Cuenta administradora');