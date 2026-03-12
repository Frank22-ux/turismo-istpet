const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD || ''),
    port: process.env.DB_PORT || 5432,
});

async function run() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resenas_tours (
                id_resena SERIAL PRIMARY KEY,
                id_tour INT REFERENCES tours(id_tour) ON DELETE CASCADE,
                id_turista INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                calificacion INT CHECK (calificacion BETWEEN 1 AND 5) NOT NULL,
                comentario TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Tabla resenas_tours creada o ya existe.");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
