const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

const runSql = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'DATABASE', 'add_rooms_table.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Migration successful: hotel_habitaciones table created.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

runSql();
