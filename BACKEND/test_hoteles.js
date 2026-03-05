const pool = require('./src/config/db');

(async () => {
    try {
        const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'hoteles'`);
        console.log("Columnas de hoteles:", res.rows.map(r => r.column_name).join(', '));
    } catch (e) {
        console.error("ERROR:", e.message);
    }
    process.exit(0);
})();
