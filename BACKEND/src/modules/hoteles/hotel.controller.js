const HotelModel = require('./hotel.model');
const path = require('path');

const hotelController = {
    // 1. OBTENER TODOS LOS HOTELES
    getHoteles: async (req, res) => {
        try {
            const hoteles = await HotelModel.findAll();
            res.json(hoteles);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener hoteles" });
        }
    },

    // 2. OBTENER UN HOTEL POR ID
    getHotelById: async (req, res) => {
        try {
            const { id } = req.params;
            const hotel = await HotelModel.findById(id);
            if (!hotel) return res.status(404).json({ message: "Hotel no encontrado" });
            res.json(hotel);
        } catch (error) {
            console.error("Error al obtener hotel:", error);
            res.status(500).json({ message: "Error en el servidor al buscar el hotel" });
        }
    },

    // 3. CREAR UN NUEVO HOTEL
    crearHotel: async (req, res) => {
        try {
            const { nombre, direccion, estrellas, telefono, latitud, longitud, descripcion } = req.body;
            let foto_url = null;
            let galeriaPaths = [];

            if (req.files && req.files.foto) {
                const foto = req.files.foto;
                const nombreFoto = `hotel_${Date.now()}${path.extname(foto.name)}`;
                await foto.mv(path.join(process.cwd(), 'uploads/hoteles', nombreFoto));
                foto_url = `/uploads/hoteles/${nombreFoto}`;
            }

            if (req.files && req.files.galeria) {
                const fotos = Array.isArray(req.files.galeria) ? req.files.galeria : [req.files.galeria];
                for (const f of fotos) {
                    const nombreF = `galeria_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(f.name)}`;
                    await f.mv(path.join(process.cwd(), 'uploads/hoteles', nombreF));
                    galeriaPaths.push(`/uploads/hoteles/${nombreF}`);
                }
            }

            const ciudadExtraida = direccion ? direccion.split(',')[0].trim() : 'No especificada';

            const nuevoHotel = await HotelModel.create({
                nombre, direccion, ciudad: ciudadExtraida, estrellas, 
                telefono, latitud: latitud || 0, longitud: longitud || 0, 
                descripcion, foto_url, galeria: galeriaPaths
            });

            res.status(201).json(nuevoHotel);
        } catch (error) {
            res.status(500).json({ message: "Error al registrar hotel", error: error.message });
        }
    },

    // 4. ACTUALIZAR HOTEL (NUEVO - REQUERIDO PARA EditarHotel.jsx)
    actualizarHotel: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, direccion, estrellas, telefono, latitud, longitud, descripcion } = req.body;

            // Buscamos el hotel actual para no perder las rutas de fotos si no se suben nuevas
            const hotelExistente = await HotelModel.findById(id);
            if (!hotelExistente) return res.status(404).json({ message: "Hotel no encontrado" });

            let foto_url = hotelExistente.foto_url;
            let galeriaPaths = hotelExistente.galeria || [];

            // Si suben una nueva foto de portada, la reemplazamos
            if (req.files && req.files.foto) {
                const foto = req.files.foto;
                const nombreFoto = `hotel_${Date.now()}${path.extname(foto.name)}`;
                await foto.mv(path.join(process.cwd(), 'uploads/hoteles', nombreFoto));
                foto_url = `/uploads/hoteles/${nombreFoto}`;
            }

            // Si suben nuevas fotos a la galería
            if (req.files && req.files.galeria) {
                const fotos = Array.isArray(req.files.galeria) ? req.files.galeria : [req.files.galeria];
                const nuevosPaths = [];
                for (const f of fotos) {
                    const nombreF = `galeria_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(f.name)}`;
                    await f.mv(path.join(process.cwd(), 'uploads/hoteles', nombreF));
                    nuevosPaths.push(`/uploads/hoteles/${nombreF}`);
                }
                galeriaPaths = nuevosPaths; // Reemplaza la galería (o podrías usar .concat() para añadir)
            }

            const ciudadExtraida = direccion ? direccion.split(',')[0].trim() : hotelExistente.ciudad;

            const hotelActualizado = await HotelModel.update(id, {
                nombre, direccion, ciudad: ciudadExtraida, estrellas, 
                telefono, latitud: latitud || 0, longitud: longitud || 0, 
                descripcion, foto_url, galeria: galeriaPaths
            });

            res.json(hotelActualizado);
        } catch (error) {
            console.error("Error al actualizar:", error);
            res.status(500).json({ message: "Error al actualizar el hotel" });
        }
    },

    // 5. ELIMINAR HOTEL
    eliminarHotel: async (req, res) => {
        try {
            const id = req.params.id;
            const eliminado = await HotelModel.delete(id);
            if (!eliminado) return res.status(404).json({ message: "Hotel no encontrado" });
            res.json({ message: "Hotel eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar hotel" });
        }
    }
};

module.exports = hotelController;