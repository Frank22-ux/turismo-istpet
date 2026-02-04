// 1. Conexión a la base de datos
const pool = require('../../config/db'); 

const ReservasModel = {
    /**
     * Registra la reserva y el pago (Transacción Atómica)
     */
    createReservaWithPago: async (datos) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // I. Insertar en la tabla 'reservas'
            const resReserva = await client.query(
                `INSERT INTO reservas (
                    id_turista, id_tour, fecha_actividad, 
                    cant_adultos, cant_ninos, cant_especial, 
                    total, estado_reserva
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Confirmada') RETURNING id_reserva`,
                [
                    datos.id_turista,
                    datos.id_tour,
                    datos.fecha_actividad,
                    datos.cant_adultos,
                    datos.cant_ninos,
                    datos.cant_especial,
                    datos.total
                ]
            );

            const id_reserva = resReserva.rows[0].id_reserva;

            // II. Insertar en la tabla 'pagos'
            await client.query(
                `INSERT INTO pagos (
                    id_reserva, monto, metodo, 
                    referencia_transaccion, estado_paypal
                ) VALUES ($1, $2, $3, $4, $5)`,
                [
                    id_reserva,
                    datos.total,
                    'PayPal',
                    datos.referencia_transaccion,
                    datos.estado_paypal
                ]
            );

            await client.query('COMMIT');
            return id_reserva;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(">> ERROR SQL EN TRANSACCIÓN:", error.detail || error.message);
            throw error; 
        } finally {
            client.release();
        }
    },

    /**
     * Obtiene historial dinámico (Cruza datos con la tabla TOURS)
     * Esto permite que el Frontend vea nombres e imágenes.
     */
    getReservasByTurista: async (id_turista) => {
        try {
            const query = `
                SELECT 
                    r.id_reserva,
                    r.fecha_actividad,
                    r.total,
                    r.estado_reserva,
                    r.cant_adultos,
                    r.cant_ninos,
                    r.cant_especial,
                    t.id_tour,
                    t.nombre AS nombre_tour,
                    t.imagen_portada,
                    t.ciudad_destino
                FROM reservas r
                INNER JOIN tours t ON r.id_tour = t.id_tour
                WHERE r.id_turista = $1
                ORDER BY r.id_reserva DESC
            `;
            const result = await pool.query(query, [id_turista]);
            return result.rows;
        } catch (error) {
            console.error(">> ERROR AL OBTENER RESERVAS:", error.message);
            throw error;
        }
    }
};

module.exports = { ReservasModel };