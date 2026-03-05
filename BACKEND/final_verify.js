const pool = require('./src/config/db');

async function verifyAvailable() {
    try {
        console.log("--- Checking Available Tours (id_guia_asignado IS NULL) ---");
        const { rows: tours } = await pool.query('SELECT id_tour, nombre, id_guia_asignado FROM tours WHERE id_guia_asignado IS NULL');
        console.table(tours);

        console.log("--- Checking Reservations for these Tours ---");
        const { rows: res } = await pool.query(`
            SELECT r.id_reserva, r.id_tour, t.nombre as tour_nombre, u.primer_nombre as turista
            FROM reservas r
            JOIN tours t ON r.id_tour = t.id_tour
            JOIN usuarios u ON r.id_turista = u.id_usuario
            WHERE t.id_guia_asignado IS NULL
        `);
        console.table(res);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

verifyAvailable();
