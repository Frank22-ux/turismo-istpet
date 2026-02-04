const { ReservasModel } = require('./reservas.model');

/**
 * Registra una nueva reserva y su pago asociado
 */
const createReserva = async (req, res) => {
    try {
        // 1. Identificación del usuario desde el middleware auth
        const id_turista = req.user?.id_usuario || req.user?.id; 

        // 2. Extracción de datos del cuerpo de la petición
        const { 
            id_tour, 
            fecha_actividad, 
            cant_adultos, 
            cant_ninos, 
            cant_especial, 
            total,
            referencia_transaccion, 
            estado_paypal 
        } = req.body;

        console.log(">> Intentando registrar reserva para Turista ID:", id_turista);

        // 3. Validación estricta de campos obligatorios
        if (!id_turista || !id_tour || !fecha_actividad || !total || !referencia_transaccion) {
            console.error(">> ERROR: Faltan campos críticos", { id_turista, id_tour, fecha_actividad, total });
            return res.status(400).json({ 
                ok: false, 
                message: "Faltan datos obligatorios (Usuario, Tour, Fecha o Pago)." 
            });
        }

        // 4. Formateo y limpieza de datos (Casteo a tipos de datos SQL)
        const datosReserva = {
            id_turista: parseInt(id_turista),
            id_tour: parseInt(id_tour),
            fecha_actividad, // Formato YYYY-MM-DD
            cant_adultos: parseInt(cant_adultos) || 1,
            cant_ninos: parseInt(cant_ninos) || 0,
            cant_especial: parseInt(cant_especial) || 0,
            total: parseFloat(total),
            referencia_transaccion,
            estado_paypal: estado_paypal || 'COMPLETED'
        };

        // 5. Llamada al modelo para ejecutar la transacción
        const id_reserva = await ReservasModel.createReservaWithPago(datosReserva);

        res.status(201).json({
            ok: true,
            id_reserva,
            message: 'Reserva y pago registrados exitosamente'
        });

    } catch (error) {
        console.error('--- ERROR EN RESERVAS CONTROLLER ---');
        console.error(error.message);
        res.status(500).json({ 
            ok: false, 
            message: 'Error al procesar la reserva en el servidor',
            error: error.message 
        });
    }
};

/**
 * Obtiene el historial de reservas del usuario logueado
 */
const getMisReservas = async (req, res) => {
    try {
        const id_turista = req.user?.id_usuario || req.user?.id;

        if (!id_turista) {
            return res.status(401).json({ ok: false, message: "Usuario no identificado" });
        }

        const reservas = await ReservasModel.getReservasByTurista(id_turista);
        
        res.json({
            ok: true,
            reservas
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "Error al obtener historial",
            error: error.message
        });
    }
};

// Exportación en formato CommonJS
module.exports = {
    createReserva,
    getMisReservas
};