const { Pool } = require('pg');
require('dotenv').config({ path: 'c:/Users/crist/OneDrive/Documentos/Biblioteca/FILEs/Paid/turismo-istpet/BACKEND/.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD || ''),
    port: process.env.DB_PORT || 5432,
});

const createTableSql = `
CREATE TABLE IF NOT EXISTS favoritos (
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
`;

async function run() {
    try {
        console.log("Creando tabla favoritos si no existe...");
        await pool.query(createTableSql);
        console.log("✅ Tabla 'favoritos' verificada/creada con éxito.");

        // Let's also verify its structure
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'favoritos'");
        console.log("Columnos de la tabla favoritos: ", res.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error('❌ Error manipulando tabla favoritos:', err.message);
    } finally {
        await pool.end();
    }
}

run();
