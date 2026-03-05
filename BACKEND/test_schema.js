const pool = require('c:\\Users\\crist\\OneDrive\\Documentos\\Biblioteca\\FILEs\\Paid\\turismo-istpet\\BACKEND\\src\\config\\db');

(async () => {
    try {
        const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'tours'`);
        console.log("Columnas de tours:", res.rows.map(r => r.column_name).join(', '));
    } catch (e) {
        console.error("ERROR:", e.message);
    }
    process.exit(0);
})();
