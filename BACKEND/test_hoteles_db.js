const pool = require('./src/config/db');

(async () => {
    try {
        const query = `
            SELECT column_name, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'hoteles'
        `;
        const { rows } = await pool.query(query);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error("ERROR:", e.message);
    }
    process.exit(0);
})();
