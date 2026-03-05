const pool = require('./src/config/db');

async function testQuery() {
    try {
        const id_guia = 14;
        const query = `
            SELECT r.*, t.nombre as tour_nombre, u.primer_nombre as turista_nombre, u.apellido_paterno as turista_apellido,
                   p.estado_pago
            FROM reservas r
            JOIN tours t ON r.id_tour = t.id_tour
            JOIN usuarios u ON r.id_turista = u.id_usuario
            LEFT JOIN pagos p ON r.id_reserva = p.id_reserva
            WHERE t.id_guia_asignado = $1 OR t.id_guia_asignado IS NULL
        `;
        const { rows } = await pool.query(query, [id_guia]);
        console.log("Found rows:", rows.length);
        if (rows.length > 0) {
            console.log("First row keys:", Object.keys(rows[0]));
            console.log("First row id_tour:", rows[0].id_tour);
            console.log("Full first row:", JSON.stringify(rows[0], null, 2));
        } else {
            console.log("No rows found for guide 14 or unassigned tours");
        }
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

testQuery();
