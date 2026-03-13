const axios = require('axios');
const geocodingController = {};

/**
 * Busca coordenadas a partir de una dirección (Forward Geocoding)
 */
geocodingController.search = async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Se requiere el parámetro "q" (consulta)' });
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search`;
        
        const response = await axios.get(url, {
            params: {
                format: 'json',
                q: q,
                limit: 1
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'es'
            },
            timeout: 5000
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error en geocoding search:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        }
        res.status(500).json({ 
            message: 'Error al consultar el servicio de mapas', 
            error: error.message,
            details: error.response?.data 
        });
    }
};

/**
 * Obtiene la dirección a partir de coordenadas (Reverse Geocoding)
 */
geocodingController.reverse = async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ message: 'Se requieren los parámetros "lat" y "lon"' });
    }

    try {
        const url = `https://nominatim.openstreetmap.org/reverse`;
        
        const response = await axios.get(url, {
            params: {
                format: 'json',
                lat: lat,
                lon: lon,
                zoom: 18,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'es'
            },
            timeout: 5000
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error en geocoding reverse:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        }
        res.status(500).json({ 
            message: 'Error al consultar el servicio de mapas', 
            error: error.message,
            details: error.response?.data 
        });
    }
};

module.exports = geocodingController;
