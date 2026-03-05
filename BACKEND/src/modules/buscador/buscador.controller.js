const pool = require('../../config/db');

const SearchController = {
    globalSearch: async (req, res) => {
        try {
            const { q, type, minPrice, maxPrice, stars, city } = req.query;
            let results = { tours: [], hoteles: [] };

            const searchTerm = q ? `%${q.toLowerCase()}%` : '%';
            const cityTerm = city ? `%${city.toLowerCase()}%` : '%';
            const minP = parseFloat(minPrice) || 0;
            const maxP = parseFloat(maxPrice) || 999999;
            const minStars = parseInt(stars) || 0;

            // 1. Buscar en TOURS
            if (!type || type === 'tours' || type === 'todos') {
                const tourQuery = `
                    SELECT * FROM tours 
                    WHERE (LOWER(nombre) LIKE $1 OR LOWER(descripcion) LIKE $1)
                    AND LOWER(ciudad_destino) LIKE $2
                    AND precio BETWEEN $3 AND $4
                    ORDER BY id_tour DESC
                `;
                const { rows } = await pool.query(tourQuery, [searchTerm, cityTerm, minP, maxP]);
                results.tours = rows;
            }

            // 2. Buscar en HOTELES
            if (!type || type === 'hoteles' || type === 'todos') {
                const hotelQuery = `
                    SELECT * FROM hoteles 
                    WHERE (LOWER(nombre) LIKE $1 OR LOWER(descripcion) LIKE $1)
                    AND LOWER(ciudad) LIKE $2
                    AND precio_noche BETWEEN $3 AND $4
                    AND estrellas >= $5
                    ORDER BY id_hotel DESC
                `;
                const { rows } = await pool.query(hotelQuery, [searchTerm, cityTerm, minP, maxP, minStars]);
                results.hoteles = rows;
            }

            res.json(results);
        } catch (error) {
            console.error("❌ Error en globalSearch:", error);
            res.status(500).json({ message: 'Error al realizar la búsqueda' });
        }
    }
};

module.exports = SearchController;
