const Tour = require('./tour.model');
const path = require('path');
const fs = require('fs');

const TourController = {
    // 1. OBTENER TODOS LOS TOURS
    getTours: async (req, res) => {
        try {
            const tours = await Tour.findAll();
            res.json(tours);
        } catch (error) {
            console.error("❌ Error en getTours:", error.message);
            res.status(500).json({ message: 'Error al obtener tours' });
        }
    },

    // 2. OBTENER UN TOUR POR ID
    getTourById: async (req, res) => {
        try {
            const { id } = req.params;
            const tour = await Tour.findById(id);
            if (!tour) {
                return res.status(404).json({ message: 'Tour no encontrado' });
            }
            res.json(tour);
        } catch (error) {
            console.error("❌ Error al obtener tour:", error.message);
            res.status(500).json({ message: 'Error al obtener el tour' });
        }
    },

    // 3. CREAR TOUR
    createTour: async (req, res) => {
        try {
            console.log('🔵 === INICIO DE CREACIÓN (FILEUPLOAD) ===');
            const { imagen_portada_ruta, galeria_rutas } = await procesarArchivos(req);

            const tourData = {
                nombre: req.body.nombre,
                ciudad_destino: req.body.ciudad_destino,
                descripcion: req.body.descripcion || '',
                precio: parseFloat(req.body.precio) || 0,
                duracion: req.body.duracion,
                // Manejo de fechas para evitar strings vacíos
                fecha_inicio: req.body.fecha_inicio || null,
                fecha_fin: req.body.fecha_fin || null,
                latitud: parseFloat(req.body.latitud) || 0,
                longitud: parseFloat(req.body.longitud) || 0,
                imagen_portada: imagen_portada_ruta,
                galeria: galeria_rutas,
                id_guia: (req.body.id_guia && req.body.id_guia !== "") ? parseInt(req.body.id_guia) : null,
                id_hotel_base: (req.body.id_hotel_base && req.body.id_hotel_base !== "") ? parseInt(req.body.id_hotel_base) : null
            };

            const newTour = await Tour.create(tourData);
            res.status(201).json({ message: '¡Tour creado!', tour: newTour });
        } catch (error) {
            console.error("❌ Error en creación:", error.message);
            res.status(500).json({ message: 'Error al crear el tour', error: error.message });
        }
    },

    // 4. ACTUALIZAR TOUR (Método PUT)
    updateTour: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`🔵 === ACTUALIZANDO TOUR ID: ${id} ===`);

            // Procesar archivos si vienen nuevos
            const { imagen_portada_ruta, galeria_rutas } = await procesarArchivos(req);

            const tourData = {
                nombre: req.body.nombre,
                ciudad_destino: req.body.ciudad_destino,
                descripcion: req.body.descripcion,
                precio: parseFloat(req.body.precio) || 0,
                duracion: req.body.duracion,
                // Aseguramos que si la fecha viene vacía se guarde como NULL
                fecha_inicio: req.body.fecha_inicio === "" ? null : req.body.fecha_inicio,
                fecha_fin: req.body.fecha_fin === "" ? null : req.body.fecha_fin,
                latitud: parseFloat(req.body.latitud) || 0,
                longitud: parseFloat(req.body.longitud) || 0,
                // Solo actualizamos la ruta si se subió un archivo nuevo
                imagen_portada: imagen_portada_ruta, 
                galeria: galeria_rutas.length > 0 ? galeria_rutas : null,
                id_guia: (req.body.id_guia && req.body.id_guia !== "") ? parseInt(req.body.id_guia) : null,
                id_hotel_base: (req.body.id_hotel_base && req.body.id_hotel_base !== "") ? parseInt(req.body.id_hotel_base) : null
            };

            const updatedTour = await Tour.update(id, tourData);
            res.json({ message: '¡Tour actualizado!', tour: updatedTour });
        } catch (error) {
            console.error("❌ Error en actualización:", error.message);
            res.status(500).json({ message: 'Error al actualizar el tour' });
        }
    },

    // 5. ELIMINAR TOUR
    deleteTour: async (req, res) => {
        try {
            const { id } = req.params;
            await Tour.delete(id);
            res.json({ message: 'Tour eliminado correctamente' });
        } catch (error) {
            console.error("❌ Error en eliminación:", error.message);
            res.status(500).json({ message: 'Error al eliminar el tour' });
        }
    }
};

// --- FUNCIÓN AUXILIAR PARA PROCESAR ARCHIVOS ---
async function procesarArchivos(req) {
    let imagen_portada_ruta = null;
    let galeria_rutas = [];
    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    if (req.files) {
        // Portada
        if (req.files.imagen_portada) {
            const portada = req.files.imagen_portada;
            const nombrePortada = `portada-${Date.now()}${path.extname(portada.name)}`;
            await portada.mv(path.join(uploadsDir, nombrePortada));
            imagen_portada_ruta = `/uploads/${nombrePortada}`;
        }
        // Galería
        if (req.files.galeria) {
            const galeria = Array.isArray(req.files.galeria) ? req.files.galeria : [req.files.galeria];
            for (let i = 0; i < galeria.length; i++) {
                const nombreGaleria = `galeria-${Date.now()}-${i}${path.extname(galeria[i].name)}`;
                await galeria[i].mv(path.join(uploadsDir, nombreGaleria));
                galeria_rutas.push(`/uploads/${nombreGaleria}`);
            }
        }
    }
    return { imagen_portada_ruta, galeria_rutas };
}

module.exports = TourController;