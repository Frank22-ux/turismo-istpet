const Hotel = require('./hotel.model');
const path = require('path');
const fs = require('fs');

const HotelController = {

    // --- 1. CREAR NUEVO HOTEL ---
    createHotel: async (req, res) => {
        try {
            console.log("--> Intentando crear hotel...");

            let fotos_galeria = [];
            let convenio_pdf_url = null;
            const uploadsDir = path.join(process.cwd(), 'uploads');

            if (req.files) {
                // Manejo de Galería
                if (req.files.fotos) {
                    const fotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
                    for (let i = 0; i < fotos.length; i++) {
                        const nombreFoto = `hotel-${Date.now()}-${i}${path.extname(fotos[i].name)}`;
                        await fotos[i].mv(path.join(uploadsDir, nombreFoto));
                        fotos_galeria.push(`/uploads/${nombreFoto}`);
                    }
                }
                // Manejo de Convenio PDF
                if (req.files.convenio) {
                    const convenio = req.files.convenio;
                    const nombreConvenio = `convenio-${Date.now()}${path.extname(convenio.name)}`;
                    await convenio.mv(path.join(uploadsDir, nombreConvenio));
                    convenio_pdf_url = `/uploads/${nombreConvenio}`;
                }
            }

            const hotelData = {
                nombre: req.body.nombre,
                direccion: req.body.direccion,
                ciudad: req.body.ciudad,
                latitud: parseFloat(req.body.latitud) || 0,
                longitud: parseFloat(req.body.longitud) || 0,
                estrellas: parseInt(req.body.estrellas) || 3,
                habitaciones_disponibles: parseInt(req.body.habitaciones_disponibles) || 10,
                precio_noche: parseFloat(req.body.precio_noche) || 0,
                amenidades: req.body.amenidades || '',
                descripcion: req.body.descripcion || '',
                fotos_galeria: JSON.stringify(fotos_galeria),
                convenio_pdf_url,
                estado_convenio: req.body.estado_convenio || 'Activo'
            };

            const newHotel = await Hotel.create(hotelData);
            
            // Procesar habitaciones si vienen en la petición
            if (req.body.habitaciones) {
                let habitaciones = [];
                try {
                    habitaciones = typeof req.body.habitaciones === 'string' 
                        ? JSON.parse(req.body.habitaciones) 
                        : req.body.habitaciones;
                    
                    await Hotel.setHabitaciones(newHotel.id_hotel, habitaciones);
                } catch (e) {
                    console.error("⚠️ Error al procesar habitaciones:", e);
                }
            }

            res.status(201).json({ message: 'Hotel creado exitosamente', hotel: newHotel });

        } catch (error) {
            console.error("❌ Error en createHotel:", error);
            res.status(500).json({ message: 'Error al guardar el hotel' });
        }
    },

    // --- 2. OBTENER TODOS ---
    getHoteles: async (req, res) => {
        try {
            const hoteles = await Hotel.findAll();
            res.json(hoteles);
        } catch (error) {
            console.error("❌ Error en getHoteles:", error);
            res.status(500).json({ message: 'Error al obtener hoteles' });
        }
    },

    // --- 3. OBTENER UN HOTEL POR ID ---
    getHotelById: async (req, res) => {
        try {
            const { id } = req.params;
            const hotel = await Hotel.findById(id);
            if (!hotel) return res.status(404).json({ message: 'Hotel no encontrado' });
            res.json(hotel);
        } catch (error) {
            console.error("❌ Error en getHotelById:", error);
            res.status(500).json({ message: 'Error al obtener el hotel' });
        }
    },

    // --- 4. ACTUALIZAR HOTEL ---
    updateHotel: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`📝 Intentando actualizar hotel ID: ${id}`);

            const existingHotel = await Hotel.findById(id);
            if (!existingHotel) return res.status(404).json({ message: 'Hotel no encontrado' });

            let fotos_galeria = existingHotel.fotos_galeria ? 
                (typeof existingHotel.fotos_galeria === 'string' ? JSON.parse(existingHotel.fotos_galeria) : existingHotel.fotos_galeria) 
                : [];
            let convenio_pdf_url = existingHotel.convenio_pdf_url;
            const uploadsDir = path.join(process.cwd(), 'uploads');

            if (req.files) {
                // Si el usuario subió fotos nuevas y el campo fotos_galeria está presente en body como reemplazo total
                // o si simplemente queremos añadir (depende de la lógica deseada, aquí asumiremos reemplazo o adición según req.body)
                
                if (req.files.fotos) {
                    const fotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
                    let nuevasFotos = [];
                    for (let i = 0; i < fotos.length; i++) {
                        const nombreFoto = `hotel-${Date.now()}-${i}${path.extname(fotos[i].name)}`;
                        await fotos[i].mv(path.join(uploadsDir, nombreFoto));
                        nuevasFotos.push(`/uploads/${nombreFoto}`);
                    }
                    // Para este sistema simplificaremos: si envía fotos, reemplaza la galería.
                    fotos_galeria = nuevasFotos;
                }

                if (req.files.convenio) {
                    const convenio = req.files.convenio;
                    const nombreConvenio = `convenio-${Date.now()}${path.extname(convenio.name)}`;
                    await convenio.mv(path.join(uploadsDir, nombreConvenio));
                    convenio_pdf_url = `/uploads/${nombreConvenio}`;
                }
            }

            const hotelData = {
                nombre: req.body.nombre || existingHotel.nombre,
                direccion: req.body.direccion || existingHotel.direccion,
                ciudad: req.body.ciudad || existingHotel.ciudad,
                latitud: req.body.latitud !== undefined ? parseFloat(req.body.latitud) : existingHotel.latitud,
                longitud: req.body.longitud !== undefined ? parseFloat(req.body.longitud) : existingHotel.longitud,
                estrellas: req.body.estrellas !== undefined ? parseInt(req.body.estrellas) : existingHotel.estrellas,
                habitaciones_disponibles: req.body.habitaciones_disponibles !== undefined ? parseInt(req.body.habitaciones_disponibles) : existingHotel.habitaciones_disponibles,
                precio_noche: req.body.precio_noche !== undefined ? parseFloat(req.body.precio_noche) : existingHotel.precio_noche,
                amenidades: req.body.amenidades !== undefined ? req.body.amenidades : existingHotel.amenidades,
                descripcion: req.body.descripcion !== undefined ? req.body.descripcion : existingHotel.descripcion,
                fotos_galeria: JSON.stringify(fotos_galeria),
                convenio_pdf_url,
                estado_convenio: req.body.estado_convenio || existingHotel.estado_convenio
            };

            const updatedHotel = await Hotel.update(id, hotelData);

            // Procesar habitaciones si vienen en la petición
            if (req.body.habitaciones) {
                let habitaciones = [];
                try {
                    habitaciones = typeof req.body.habitaciones === 'string' 
                        ? JSON.parse(req.body.habitaciones) 
                        : req.body.habitaciones;
                    
                    await Hotel.setHabitaciones(id, habitaciones);
                } catch (e) {
                    console.error("⚠️ Error al procesar habitaciones:", e);
                }
            }

            res.json({ message: 'Hotel actualizado exitosamente', hotel: updatedHotel });

        } catch (error) {
            console.error("❌ Error en updateHotel:", error);
            res.status(500).json({ message: 'Error al actualizar el hotel' });
        }
    },

    // --- 5. ELIMINAR HOTEL ---
    deleteHotel: async (req, res) => {
        try {
            const { id } = req.params;
            await Hotel.delete(id);
            res.json({ message: 'Hotel eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar el hotel' });
        }
    }
};

module.exports = HotelController;
