const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const Pago = require('./pago.model');
const path = require('path');

router.post('/', async (req, res) => {
    try {
        let referencia_txn = req.body.referencia_txn || null;
        if (req.files && req.files.comprobante) {
            const file = req.files.comprobante;
            const nombre = `pago-${Date.now()}${path.extname(file.name)}`;
            await file.mv(path.join(process.cwd(), 'uploads', nombre));
            // No existe columna "comprobante_url" en el esquema actual.
            // Guardamos el path como referencia si no viene una referencia explícita.
            if (!referencia_txn) referencia_txn = `/uploads/${nombre}`;
        }

        const newPago = await Pago.create({
            ...req.body,
            referencia_txn
        });
        res.status(201).json({ message: 'Pago registrado', pago: newPago });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar pago' });
    }
});

router.post('/simulate', async (req, res) => {
    try {
        const { id_reserva, monto, metodo_pago } = req.body;
        const result = await Pago.simulate(id_reserva, monto, metodo_pago);
        res.json({ message: 'Simulación de pago exitosa', payment: result });
    } catch (error) {
        console.error("❌ Error en simulacion pago:", error);
        res.status(500).json({ message: 'Error en la simulación del pago' });
    }
});

router.get('/reserva/:id_reserva', async (req, res) => {
    try {
        const pagos = await Pago.findByReserva(req.params.id_reserva);
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pagos' });
    }
});

module.exports = router;
