const UserModel = require('./user.model');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('../../config/db');

const userController = {
    // Obtener perfil actual
    getPerfil: async (req, res) => {
        try {
            // El ID viene del token (JWT) a través del middleware
            const id_usuario = req.user.id; 
            const usuario = await UserModel.findById(id_usuario);
            if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

            // Obtener últimas reservas (historial) del usuario con información básica del tour
            const reservasQuery = `
                SELECT r.id_reserva, r.fecha_actividad, r.cantidad_personas, r.estado_reserva,
                       t.id_tour, t.nombre as tour_nombre, t.ciudad_destino, t.imagen_portada
                FROM reservas r
                JOIN tours t ON r.id_tour = t.id_tour
                WHERE r.id_turista = $1
                ORDER BY r.fecha_reserva DESC
                LIMIT 10
            `;
            const { rows: reservas } = await pool.query(reservasQuery, [id_usuario]);

            // Obtener insignias del usuario
            const badgesQuery = `
                SELECT ui.id AS rel_id, b.id_insignia, b.nombre, b.descripcion, b.icono_url, ui.asignado_por, ui.fecha_asignacion
                FROM usuario_insignias ui
                JOIN insignias b ON ui.id_insignia = b.id_insignia
                WHERE ui.id_usuario = $1
                ORDER BY ui.fecha_asignacion DESC
            `;
            const { rows: badges } = await pool.query(badgesQuery, [id_usuario]);

            res.json({ user: usuario, reservas, badges });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener perfil" });
        }
    },

    // Actualizar perfil con foto y password
    actualizarPerfil: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, telefono, descripcion_perfil, password, pais, ciudad, idiomas, nivel_experiencia } = req.body;

            // Preferencias pueden venir como JSON string o como objeto
            let preferencias = null;
            if (req.body.preferencias) {
                try {
                    preferencias = typeof req.body.preferencias === 'string' ? JSON.parse(req.body.preferencias) : req.body.preferencias;
                } catch (e) {
                    preferencias = null;
                }
            }

            let foto_url = null;

            // Lógica de express-fileupload
            if (req.files && req.files.foto) {
                const archivo = req.files.foto;
                const extension = path.extname(archivo.name);
                const nombreArchivo = `perfil_${id_usuario}_${Date.now()}${extension}`;
                
                // Guardar en la carpeta uploads/perfiles
                const rutaGuardado = path.join(process.cwd(), 'uploads/perfiles', nombreArchivo);
                await archivo.mv(rutaGuardado);
                
                foto_url = `/uploads/perfiles/${nombreArchivo}`;
            }

            // Encriptar password si el usuario decidió cambiarla
            let passwordHashed = null;
            if (password && password.trim() !== "") {
                passwordHashed = await bcrypt.hash(password, 10);
            }

            const usuarioActualizado = await UserModel.updateProfile(id_usuario, {
                primer_nombre,
                segundo_nombre,
                apellido_paterno,
                apellido_materno,
                telefono,
                descripcion_perfil,
                foto_url,
                preferencias,
                pais,
                ciudad,
                idiomas,
                nivel_experiencia,
                password: passwordHashed
            });

            res.json({
                message: "¡Perfil actualizado!",
                user: usuarioActualizado
            });

        } catch (error) {
            console.error("Error en actualizarPerfil:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    }
};

module.exports = userController;