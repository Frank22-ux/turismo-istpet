const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD || ''), // ⬅️ Esto evita el error de SASL
    port: process.env.DB_PORT || 5432,
});

// Prueba de conexión inicial
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error conectando a PostgreSQL local:', err.message);
    } else {
        console.log('🐘 Conexión a PostgreSQL exitosa (Local)');
    }
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en el cliente de PostgreSQL', err);
    process.exit(-1);
});

module.exports = pool;