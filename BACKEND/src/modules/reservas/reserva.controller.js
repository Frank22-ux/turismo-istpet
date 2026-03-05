const Reserva = require('./reserva.model');

const ReservaController = {
    crearReserva: async (req, res) => {
        try {
            const id_turista = req.user?.id || req.body.id_turista;
            const newReserva = await Reserva.create({ ...req.body, id_turista });
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
