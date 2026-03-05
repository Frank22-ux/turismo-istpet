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

            // Helper para limpiar strings vacíos a null
            const clean = (val) => (val === undefined || val === null || val === "" || val === "null" || val === "undefined") ? null : val;
            const cleanInt = (val) => {
                const c = clean(val);
                return c ? parseInt(c) : null;
            };
            const cleanFloat = (val) => {
                const c = clean(val);
                return c ? parseFloat(c) : 0;
            };

            // Helper para parsear arrays desde FormData (vienen como JSON string)
            const parseArr = (val) => {
                if (!val) return null;
                try { return JSON.parse(val); } catch { return null; }
            };

            const tourData = {
                nombre: req.body.nombre,
                ciudad_destino: req.body.ciudad_destino,
                descripcion: req.body.descripcion || '',
                precio: cleanFloat(req.body.precio),
                duracion: req.body.duracion,
                fecha_inicio: clean(req.body.fecha_inicio),
                fecha_fin: clean(req.body.fecha_fin),
                latitud: cleanFloat(req.body.latitud),
                longitud: cleanFloat(req.body.longitud),
                id_guia_asignado: cleanInt(req.body.id_guia),
                id_hotel_base: cleanInt(req.body.id_hotel_base),
                imagen_portada: imagen_portada_ruta,
                galeria: galeria_rutas.length > 0 ? JSON.stringify(galeria_rutas) : null,
                // Nuevos campos de detalle
                dificultad: req.body.dificultad || 'Moderada',
                maximo_personas: cleanInt(req.body.maximo_personas) || 10,
                idiomas: parseArr(req.body.idiomas),
                incluye: parseArr(req.body.incluye),
                puntos_interes: parseArr(req.body.puntos_interes)
            };

            const newTour = await Tour.create(tourData);
            console.log("✅ Tour guardado con éxito");
            res.status(201).json({ message: 'Tour creado exitosamente', tour: newTour });

        } catch (error) {
            console.error("❌ Error en createTour:", error);
            // Log to file for deep debugging
            const logMsg = `[${new Date().toISOString()}] Error en createTour: ${error.stack || error.message}\n`;
            fs.appendFileSync(path.join(process.cwd(), 'errors.log'), logMsg);
            res.status(500).json({ message: 'Error al guardar el tour', error: error.message });
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

            const parseArr = (val) => {
                if (!val) return null;
                try { return JSON.parse(val); } catch { return null; }
            };

            // Helper para limpiar strings vacíos a null
            const clean = (val) => (val === undefined || val === null || val === "" || val === "null" || val === "undefined") ? null : val;
            const cleanInt = (val) => {
                const c = clean(val);
                return c ? parseInt(c) : null;
            };
            const cleanFloat = (val) => {
                const c = clean(val);
                return c ? parseFloat(c) : 0;
            };

            const tourData = {
                nombre: req.body.nombre,
                ciudad_destino: req.body.ciudad_destino,
                descripcion: req.body.descripcion || '',
                precio: cleanFloat(req.body.precio),
                duracion: req.body.duracion,
                fecha_inicio: clean(req.body.fecha_inicio),
                fecha_fin: clean(req.body.fecha_fin),
                latitud: cleanFloat(req.body.latitud),
                longitud: cleanFloat(req.body.longitud),
                id_guia_asignado: cleanInt(req.body.id_guia),
                id_hotel_base: cleanInt(req.body.id_hotel_base),
                imagen_portada: imagen_portada_ruta,
                galeria: galeria_rutas.length > 0 ? JSON.stringify(galeria_rutas) : null,
                // Nuevos campos de detalle (COALESCE en modelo preserva los existentes si no vienen)
                dificultad: clean(req.body.dificultad),
                maximo_personas: cleanInt(req.body.maximo_personas),
                idiomas: parseArr(req.body.idiomas),
                incluye: parseArr(req.body.incluye),
                puntos_interes: parseArr(req.body.puntos_interes)
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
    },

    // --- 6. OBTENER TOURS DISPONIBLES PARA GUÍAS ---
    getAvailableTours: async (req, res) => {
        try {
            const tours = await Tour.findAvailable();
            res.json(tours);
        } catch (error) {
            console.error("❌ Error en getAvailableTours:", error);
            res.status(500).json({ message: 'Error al obtener tours disponibles' });
        }
    },

    // --- 7. OBTENER MIS TOURS (COMO GUÍA) ---
    getGuiasTours: async (req, res) => {
        try {
            const id_guia = req.user.id;
            const tours = await Tour.findByGuia(id_guia);
            res.json(tours);
        } catch (error) {
            console.error("❌ Error en getGuiasTours:", error);
            res.status(500).json({ message: 'Error al obtener mis tours' });
        }
    },

    // --- 8. ASIGNARME UN TOUR ---
    assignGuia: async (req, res) => {
        try {
            const { id } = req.params;
            const id_guia = req.user.id;

            // Verificar si el tour ya tiene guía
            const tour = await Tour.findById(id);
            if (!tour) {
                return res.status(404).json({ message: 'El tour no existe' });
            }
            if (tour.id_guia_asignado) {
                return res.status(400).json({ message: 'Este tour ya tiene un guía asignado' });
            }

            const updatedTour = await Tour.assignGuia(id, id_guia);
            res.json({ message: 'Te has asignado el tour exitosamente', tour: updatedTour });
        } catch (error) {
            console.error("❌ Error en assignGuia:", error);
            res.status(500).json({ message: 'Error al asignarte el tour' });
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