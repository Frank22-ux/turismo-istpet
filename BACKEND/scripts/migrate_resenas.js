const pool = require('../src/config/db');

async function migrate() {
    try {
        console.log('--- Iniciando migración de tablas de reseñas ---');
        
        // Tabla resenas_tours
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resenas_tours (
                id_resena SERIAL PRIMARY KEY,
                id_tour INTEGER NOT NULL,
                id_turista INTEGER NOT NULL,
                calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
                comentario TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_resena_tour FOREIGN KEY (id_tour) REFERENCES tours(id_tour) ON DELETE CASCADE,
                CONSTRAINT fk_resena_turista FOREIGN KEY (id_turista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabla resenas_tours creada o ya existente');

        // Tabla resenas_guias
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resenas_guias (
                id_resena SERIAL PRIMARY KEY,
                id_guia INTEGER NOT NULL,
                id_turista INTEGER NOT NULL,
                calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
                comentario TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_resena_guia FOREIGN KEY (id_guia) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                CONSTRAINT fk_resena_turista_guia FOREIGN KEY (id_turista) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabla resenas_guias creada o ya existente');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error en la migración:', err);
        process.exit(1);
    }
}

migrate();
