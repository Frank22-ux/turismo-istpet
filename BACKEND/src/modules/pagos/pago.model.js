const pool = require('../../config/db');

const Pago = {
    // 1. REGISTRAR PAGO
    create: async (data) => {
        const query = `
            INSERT INTO pagos 
            (id_reserva, monto, metodo_pago, referencia_txn, estado_pago) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;

        const values = [
            data.id_reserva,
            data.monto,
            data.metodo_pago || 'PayPal',
            data.referencia_txn || null,
            data.estado_pago || 'PENDING'
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 2. BUSCAR POR RESERVA
    findByReserva: async (id_reserva) => {
        const query = 'SELECT * FROM pagos WHERE id_reserva = $1';
        const { rows } = await pool.query(query, [id_reserva]);
        return rows;
    },

    // Simulación de pasarela (Simplemente crea el registro y actualiza reserva)
    simulate: async (id_reserva, monto, metodo_pago) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const txnId = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            // 1. Crear el pago
            const paymentQuery = `
                INSERT INTO pagos (id_reserva, monto, metodo_pago, referencia_txn, estado_pago)
                VALUES ($1, $2, $3, $4, 'COMPLETED')
                RETURNING *
            `;
            const { rows: paymentRows } = await client.query(paymentQuery, [id_reserva, monto, metodo_pago || 'PayPal', txnId]);

            // 2. Actualizar la reserva a 'Confirmada'
            await client.query('UPDATE reservas SET estado_reserva = $1 WHERE id_reserva = $2', ['Confirmada', id_reserva]);

            await client.query('COMMIT');
            return paymentRows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = Pago;
