const GuiaDetalle = require('./guia.model');
const UserModel = require('../usuarios/user.model');
const path = require('path');
const bcrypt = require('bcryptjs');

const GuiaController = {
    // --- 1. REGISTRAR UN NUEVO GUÍA (USUARIO + DETALLES) ---
    registrarGuia: async (req, res) => {
        try {
            console.log("--> Iniciando registro de guía...");

            // 1. Procesar Archivos (Foto y CV)
            let foto_url = null;
            let cv_pdf_url = null;
            const uploadsDir = path.join(process.cwd(), 'uploads');

            if (req.files) {
                if (req.files.foto) {
                    const foto = req.files.foto;
                    const nombreFoto = `guia-foto-${Date.now()}${path.extname(foto.name)}`;
                    await foto.mv(path.join(uploadsDir, nombreFoto));
                    foto_url = `/uploads/${nombreFoto}`;
                }
                if (req.files.cv) {
                    const cv = req.files.cv;
                    const nombreCv = `guia-cv-${Date.now()}${path.extname(cv.name)}`;
                    await cv.mv(path.join(uploadsDir, nombreCv));
                    cv_pdf_url = `/uploads/${nombreCv}`;
                }
            }

            // 2. Crear el Usuario (Rol Guía = 2)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = req.body.password
                ? await bcrypt.hash(req.body.password, salt)
                : await bcrypt.hash('Guia123!', salt); // Password por defecto si no viene

            const userData = {
                primer_nombre: req.body.primer_nombre,
                segundo_nombre: req.body.segundo_nombre,
                apellido_paterno: req.body.apellido_paterno,
                apellido_materno: req.body.apellido_materno,
                cedula: req.body.cedula,
                correo: req.body.correo,
                password: hashedPassword,
                codigo_pais: req.body.codigo_pais || '+593',
                numero_celular: req.body.numero_celular,
                id_rol: 2, // GUÍA
                foto_url
            };

            const newUser = await UserModel.create(userData);

            // 3. Crear los Detalles del Guía
            const guiaData = {
                idiomas: req.body.idiomas, // Se espera JSON string o array
                experiencia_anios: parseInt(req.body.experiencia) || 0,
                especialidades: req.body.especialidades,
                bio: req.body.bio,
                disponibilidad: req.body.disponibilidad,
                cv_pdf_url,
                id_hotel_asignado: req.body.id_hotel_asignado || null
            };

            const newDetails = await GuiaDetalle.upsert(newUser.id_usuario, guiaData);

            res.status(201).json({
                message: 'Guía registrado correctamente',
                guia: { ...newUser, ...newDetails }
            });

        } catch (error) {
            console.error("❌ Error en registrarGuia:", error);
            res.status(500).json({ message: 'Error al registrar el guía' });
        }
    },

    // --- 2. OBTENER TODOS LOS GUÍAS ---
    getGuias: async (req, res) => {
        try {
            const guias = await GuiaDetalle.findAllWithNames();
            res.json(guias);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener guías' });
        }
    },

    // --- 3. ACTUALIZAR GUÍA ---
    updateGuia: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`📝 Actualizando guía ID: ${id}`);

            let foto_url = req.body.foto_url;
            let cv_pdf_url = req.body.cv_pdf_url;
            const uploadsDir = path.join(process.cwd(), 'uploads');

            if (req.files) {
                if (req.files.foto) {
                    const foto = req.files.foto;
                    const nombreFoto = `guia-foto-${Date.now()}${path.extname(foto.name)}`;
                    await foto.mv(path.join(uploadsDir, nombreFoto));
                    foto_url = `/uploads/${nombreFoto}`;
                }
                if (req.files.cv) {
                    const cv = req.files.cv;
                    const nombreCv = `guia-cv-${Date.now()}${path.extname(cv.name)}`;
                    await cv.mv(path.join(uploadsDir, nombreCv));
                    cv_pdf_url = `/uploads/${nombreCv}`;
                }
            }

            // Actualizar tabla usuarios
            const userData = {
                primer_nombre: req.body.primer_nombre,
                segundo_nombre: req.body.segundo_nombre,
                apellido_paterno: req.body.apellido_paterno,
                apellido_materno: req.body.apellido_materno,
                correo: req.body.correo,
                codigo_pais: req.body.codigo_pais,
                numero_celular: req.body.numero_celular,
                foto_url
            };

            // Solo actualizar password si se proporciona una nueva
            if (req.body.password && req.body.password.trim() !== '') {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(req.body.password, salt);
            }

            await UserModel.update(id, userData);

            // Actualizar tabla guias_detalles
            const experienciaParsed = parseInt(req.body.experiencia);
            const guiaData = {
                idiomas: req.body.idiomas,
                experiencia_anios: Number.isFinite(experienciaParsed) ? experienciaParsed : 0,
                especialidades: req.body.especialidades,
                bio: req.body.bio,
                disponibilidad: req.body.disponibilidad,
                cv_pdf_url,
                id_hotel_asignado: req.body.id_hotel_asignado
            };
            await GuiaDetalle.upsert(id, guiaData);

            res.json({ message: 'Guía actualizado correctamente' });
        } catch (error) {
            console.error("❌ Error en updateGuia:", error);
            res.status(500).json({ message: 'Error al actualizar el guía' });
        }
    },

    // --- 4. ELIMINAR GUÍA ---
    deleteGuia: async (req, res) => {
        try {
            const { id } = req.params;
            await UserModel.delete(id);
            res.json({ message: 'Guía eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar el guía' });
        }
    }
};

module.exports = GuiaController;
