const Resena = require('./resena.model');

const ResenaController = {
    // 1. Crear una reseña
    crearResena: async (req, res) => {
        try {
            const id_turista = req.user.id;
            const { id_tour, id_guia, calificacion, comentario, tipo } = req.body;

            if (tipo === 'guia') {
                if (!id_guia || !calificacion) return res.status(400).json({ message: "Se requiere id_guia y calificacion" });
                const nuevaResena = await Resena.createGuia({ id_guia, id_turista, calificacion, comentario });
                return res.status(201).json({ message: "Reseña de guía creada con éxito", resena: nuevaResena });
            }
            
            if (tipo === 'hotel') {
                const { id_hotel } = req.body;
                if (!id_hotel || !calificacion) return res.status(400).json({ message: "Se requiere id_hotel y calificacion" });
                const nuevaResena = await Resena.createHotel({ id_hotel, id_turista, calificacion, comentario });
                return res.status(201).json({ message: "Reseña de hotel creada con éxito", resena: nuevaResena });
            }

            if (!id_tour || !calificacion) {
                return res.status(400).json({ message: "Se requiere id_tour y calificacion" });
            }

            const nuevaResena = await Resena.create({ id_tour, id_turista, calificacion, comentario });
            res.status(201).json({ message: "Reseña de tour creada con éxito", resena: nuevaResena });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al crear la reseña" });
        }
    },

    // 2. Obtener reseñas de un tour
    getResenasByTour: async (req, res) => {
        try {
            const { id_tour } = req.params;
            const resenas = await Resena.findByTour(id_tour);
            const stats = await Resena.getStatsByTour(id_tour);
            
            res.json({ stats, resenas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener las reseñas del tour" });
        }
    },

    // 3. Obtener reseñas de un guía
    getResenasByGuia: async (req, res) => {
        try {
            const { id_guia } = req.params;
            const resenas = await Resena.findByGuia(id_guia);
            const stats = await Resena.getStatsByGuia(id_guia);
            
            res.json({ stats, resenas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener las reseñas del guía" });
        }
    },

    // 4. Obtener reseñas de un hotel
    getResenasByHotel: async (req, res) => {
        try {
            const { id_hotel } = req.params;
            const resenas = await Resena.findByHotel(id_hotel);
            const stats = await Resena.getStatsByHotel(id_hotel);
            
            res.json({ stats, resenas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener las reseñas del hotel" });
        }
    },

    // 5. Obtener reseñas recientes (para el dashboard - VOces Reales)
    getRecentReviews: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const resenas = await Resena.getRecent(limit);
            res.json({ resenas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al obtener las reseñas recientes" });
        }
    }
};

module.exports = ResenaController;
