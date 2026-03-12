const pool = require('../src/config/db');

async function migrate() {
    try {
        console.log('--- Iniciando migración de Fase 5 (Ofertas y Reseñas Hoteles) ---');
        
        // 1. Añadir columnas a 'tours' si no existen
        console.log('➜ Verificando columnas en tabla tours...');
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tours' AND column_name='en_oferta') THEN 
                    ALTER TABLE tours ADD COLUMN en_oferta BOOLEAN DEFAULT false; 
                END IF; 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tours' AND column_name='descuento') THEN 
                    ALTER TABLE tours ADD COLUMN descuento INTEGER DEFAULT 0; 
                END IF; 
            END $$;
        `);
        console.log('✅ Columnas en_oferta y descuento validadas en tabla tours');

        // 2. Crear tabla resenas_hoteles
        console.log('➜ Creando tabla resenas_hoteles...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resenas_hoteles (
                id_resena SERIAL PRIMARY KEY,
                id_hotel INTEGER NOT NULL,
                id_turista INTEGER NOT NULL,
                calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
                comentario TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_resena_hotel FOREIGN KEY (id_hotel) REFERENCES hoteles(id_hotel) ON DELETE CASCADE,
                CONSTRAINT fk_resena_turista_hotel FOREIGN KEY (id_turista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabla resenas_hoteles creada o ya existente');

        console.log('--- Migración completada exitosamente ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en la migración:', err);
        process.exit(1);
    }
}

migrate();
