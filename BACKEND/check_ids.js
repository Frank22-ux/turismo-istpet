const pool = require('./src/config/db');

async function checkIds() {
    try {
        const catRes = await pool.query('SELECT * FROM categorias LIMIT 1');
        const hotelRes = await pool.query('SELECT * FROM hoteles LIMIT 1');
        console.log("Categories:", catRes.rows);
        console.log("Hotels:", hotelRes.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkIds();
