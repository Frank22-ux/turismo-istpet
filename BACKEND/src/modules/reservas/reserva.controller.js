const Reserva = require('./reserva.model');
const Tour = require('../tours/tour.model');
const Notificacion = require('../admin/notificacion.model');
const pool = require('../../config/db');

const ReservaController = {
    crearReserva: async (req, res) => {
        try {
            const id_turista = req.user?.id || req.body.id_turista;
            const { id_tour, cantidad_personas } = req.body;

            // 1. Verificar capacidad del tour
            const tour = await Tour.findById(id_tour);
            if (!tour) return res.status(404).json({ message: 'Tour no encontrado' });

            const cuposOcupados = await Reserva.getOccupiedSpots(id_tour);
            const cuposDisponibles = tour.maximo_personas - cuposOcupados;

            if (cantidad_personas > cuposDisponibles) {
                return res.status(400).json({ 
                    message: `Tour lleno o capacidad insuficiente. Cupos disponibles: ${cuposDisponibles}` 
                });
            }

            // 2. Crear reserva
            const newReserva = await Reserva.create({ ...req.body, id_turista });

            // --- NOTIFICAR A ADMINISTRADORES ---
            try {
                const clienteNombre = req.user?.nombre || 'Un cliente';
                const itemNombre = tour?.nombre || 'un servicio';
                
                const { rows: admins } = await pool.query('SELECT id_usuario FROM usuarios WHERE id_rol = 1');
                
                for (const admin of admins) {
                    await Notificacion.create({
                        id_usuario_destino: admin.id_usuario,
                        titulo: 'Nueva Reserva Realizada',
                        mensaje: `El cliente <strong>${clienteNombre}</strong> ha realizado una reserva para <strong>${itemNombre}</strong>.`,
                        tipo: 'nueva_reserva',
                        id_referencia: newReserva.id_reserva
                    });
                }
                console.log(`🔔 Notificación de reserva enviada a ${admins.length} administradores`);
            } catch (notifError) {
                console.error("❌ Error al crear notificación de reserva:", notifError);
            }

            res.status(201).json({ message: 'Reserva creada', reserva: newReserva });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear reserva' });
        }
    },

    getMisReservas: async (req, res) => {
        try {
            const id_turista = req.user.id;
            const reservas = await Reserva.findByUser(id_turista);
            res.json(reservas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener reservas' });
        }
    },

    getAllReservas: async (req, res) => {
        try {
            const reservas = await Reserva.findAll();
            res.json(reservas);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener todas las reservas' });
        }
    },

    actualizarEstado: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const actualizada = await Reserva.updateStatus(id, estado);
            res.json({ message: 'Reserva actualizada', reserva: actualizada });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar reserva' });
        }
    },

    getGuiasReservas: async (req, res) => {
        try {
            const id_guia = req.user.id;
            const asignadas = await Reserva.findByGuia(id_guia);
            const disponibles = await Reserva.findAvailableForGuides();

            // Combinamos ambas pero podríamos marcarlas
            const todas = [
                ...asignadas.map(r => ({ ...r, asignada_a_mi: true })),
                ...disponibles.map(r => ({ ...r, asignada_a_mi: false }))
            ];

            res.json(todas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener reservas del guía' });
        }
    }
};

module.exports = ReservaController;
