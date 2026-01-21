const Tour = require('./tour.model');
const path = require('path');
const fs = require('fs');

const TourController = {
    
    // --- 1. CREAR NUEVO TOUR ---
    createTour: async (req, res) => {
        try {
            console.log("--> Intentando crear tour...");
            
            // Procesar archivos (Portada y Galería)
            const { imagen_portada_ruta, galeria_rutas } = await procesarArchivos(req);

            const tourData = {
                nombre: req.body.nombre,
                ciudad_destino: req.body.ciudad_destino,
                descripcion: req.body.descripcion || '',
                precio: parseFloat(req.body.precio) || 0,
                duracion: req.body.duracion,
                fecha_inicio: req.body.fecha_inicio || null,
                fecha_fin: req.body.fecha_fin || null,
                latitud: parseFloat(req.body.latitud) || 0,
                longitud: parseFloat(req.body.longitud) || 0,
                id_guia: req.body.id_guia || null,
                id_hotel_base: req.body.id_hotel_base || null,
                imagen_portada: imagen_portada_ruta,
                galeria: galeria_rutas 
            };

            const newTour = await Tour.create(tourData);
            console.log("✅ Tour guardado con éxito");
            res.status(201).json({ message: 'Tour creado exitosamente', tour: newTour });

        } catch (error) {
            console.error("❌ Error en createTour:", error);
            res.status(500).json({ message: 'Error al guardar el tour' });
        }
    },

    // --- 2. OBTENER TODOS LOS TOURS ---
    getTours: async (req, res) => {
        try {
            const tours = await Tour.findAll();
            res.json(tours);
        } catch (error) {
            console.error("❌ Error en getTours:", error);
            res.status(500).json({ message: 'Error al obtener tours' });
        }
    },

    // --- 3. OBTENER UN TOUR POR ID (Para editar) ---
    getTourById: async (req, res) => {
        try {
            const { id } = req.params;
            const tour = await Tour.findById(id);
            if (!tour) {
                return res.status(404).json({ message: 'Tour no encontrado' });
            }
            res.json(tour);
        } catch (error) {
            console.error("❌ Error en getTourById:", error);
            res.status(500).json({ message: 'Error al obtener el tour' });
        }
    },

    // --- 4. ACTUALIZAR TOUR ---
    updateTour: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`📝 Intentando actualizar tour ID: ${id}`);

            // Procesar archivos nuevos (si los hay)
            const { imagen_portada_ruta, galeria_rutas } = await procesarArchivos(req);

            const tourData = {
                nombre: req.body.nombre,
                ciudad_destino: req.body.ciudad_destino,
                descripcion: req.body.descripcion || '',
                precio: parseFloat(req.body.precio) || 0,
                duracion: req.body.duracion,
                fecha_inicio: req.body.fecha_inicio || null,
                fecha_fin: req.body.fecha_fin || null,
                latitud: parseFloat(req.body.latitud) || 0,
                longitud: parseFloat(req.body.longitud) || 0,
                id_guia: req.body.id_guia || null,
                id_hotel_base: req.body.id_hotel_base || null,
                // Si el usuario no subió foto nueva, imagen_portada_ruta será null
                imagen_portada: imagen_portada_ruta, 
                galeria: galeria_rutas.length > 0 ? galeria_rutas : null
            };

            const updatedTour = await Tour.update(id, tourData);
            console.log("✅ Tour actualizado con éxito");
            res.json({ message: 'Tour actualizado exitosamente', tour: updatedTour });

        } catch (error) {
            console.error("❌ Error en updateTour:", error);
            res.status(500).json({ message: 'Error al actualizar el tour' });
        }
    },

    // --- 5. ELIMINAR TOUR ---
    deleteTour: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedTour = await Tour.delete(id);
            
            if (!deletedTour) {
                return res.status(404).json({ message: 'El tour no existe' });
            }

            console.log(`🗑️ Tour ID ${id} eliminado`);
            res.json({ message: 'Tour eliminado correctamente' });
        } catch (error) {
            console.error("❌ Error en deleteTour:", error);
            res.status(500).json({ message: 'Error al eliminar el tour' });
        }
    }
};

// --- FUNCIÓN AUXILIAR PARA PROCESAR ARCHIVOS ---
async function procesarArchivos(req) {
    let imagen_portada_ruta = null;
    let galeria_rutas = [];
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Asegurar que la carpeta existe
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    if (req.files) {
        // 1. Portada
        if (req.files.imagen_portada) {
            const portada = req.files.imagen_portada;
            const nombrePortada = `portada-${Date.now()}${path.extname(portada.name)}`;
            await portada.mv(path.join(uploadsDir, nombrePortada));
            imagen_portada_ruta = `/uploads/${nombrePortada}`;
            console.log("📸 Portada procesada:", imagen_portada_ruta);
        }
        // 2. Galería
        if (req.files.galeria) {
            const galeria = Array.isArray(req.files.galeria) ? req.files.galeria : [req.files.galeria];
            for (let i = 0; i < galeria.length; i++) {
                const nombreGaleria = `galeria-${Date.now()}-${i}${path.extname(galeria[i].name)}`;
                await galeria[i].mv(path.join(uploadsDir, nombreGaleria));
                galeria_rutas.push(`/uploads/${nombreGaleria}`);
            }
            console.log("🖼️ Galería procesada:", galeria_rutas.length, "fotos");
        }
    }
    return { imagen_portada_ruta, galeria_rutas };
}

module.exports = TourController;