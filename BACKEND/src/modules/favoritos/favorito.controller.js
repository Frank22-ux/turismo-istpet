const Favorito = require('./favorito.model');

const FavoritoController = {
    addFavorito: async (req, res) => {
        try {
            const { id_tour, id_hotel } = req.body;
            const id_usuario = req.user.id; // Asumiendo que el middleware de auth inyecta req.user

            const result = await Favorito.add(id_usuario, id_tour, id_hotel);
            res.status(201).json({ message: 'Agregado a favoritos', favorito: result });
        } catch (error) {
            console.error("❌ Error en addFavorito:", error);
            res.status(500).json({ message: 'Error al agregar a favoritos' });
        }
    },

    removeFavorito: async (req, res) => {
        try {
            const { id_tour, id_hotel } = req.body;
            const id_usuario = req.user.id;

            await Favorito.remove(id_usuario, id_tour, id_hotel);
            res.json({ message: 'Eliminado de favoritos' });
        } catch (error) {
            console.error("❌ Error en removeFavorito:", error);
            res.status(500).json({ message: 'Error al eliminar de favoritos' });
        }
    },

    getMisFavoritos: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            const favoritos = await Favorito.findByUser(id_usuario);
            res.json(favoritos);
        } catch (error) {
            console.error("❌ Error en getMisFavoritos:", error);
            res.status(500).json({ message: 'Error al obtener favoritos' });
        }
    }
};

module.exports = FavoritoController;
