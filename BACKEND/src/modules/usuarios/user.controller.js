const UserModel = require('./user.model');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('../../config/db');

const userController = {
    // 1. Obtener perfil actual (Incluye ID de Guía si aplica)
    getPerfil: async (req, res) => {
        try {
            // El ID viene del token (JWT) a través del middleware de autenticación
            const id_usuario = req.user.id; 

            // Consulta extendida: Buscamos en usuarios y unimos con guias
            // Esto permite que el Dashboard de Guía reciba su 'id_guia'
            const perfilQuery = `
                SELECT 
                    u.id_usuario, u.primer_nombre, u.segundo_nombre, 
                    u.apellido_paterno, u.apellido_materno, u.correo, 
                    u.foto_url, u.telefono, u.id_rol, u.activo,
                    g.id_guia, g.especialidad, g.bio
                FROM usuarios u
                LEFT JOIN guias g ON u.id_usuario = g.id_usuario
                WHERE u.id_usuario = $1
            `;
            
            const { rows } = await pool.query(perfilQuery, [id_usuario]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            const usuario = rows[0];

            // 2. Obtener últimas reservas (Historial para Turistas)
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

            // 3. Obtener insignias del usuario
            const badgesQuery = `
                SELECT ui.id AS rel_id, b.id_insignia, b.nombre, b.descripcion, b.icono_url, ui.asignado_por, ui.fecha_asignacion
                FROM usuario_insignias ui
                JOIN insignias b ON ui.id_insignia = b.id_insignia
                WHERE ui.id_usuario = $1
                ORDER BY ui.fecha_asignacion DESC
            `;
            const { rows: badges } = await pool.query(badgesQuery, [id_usuario]);

            // Enviamos la respuesta unificada
            // En el frontend (GuiaDashboard) usarás: res.data.id_guia
            res.json({ 
                user: usuario, 
                reservas, 
                badges,
                id_guia: usuario.id_guia // Acceso directo para facilitar el Dashboard
            });

        } catch (error) {
            console.error("Error al obtener perfil:", error);
            res.status(500).json({ message: "Error al obtener perfil" });
        }
    },

    // 2. Actualizar perfil con foto y password
    actualizarPerfil: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            const { 
                primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, 
                telefono, descripcion_perfil, password, pais, ciudad, 
                idiomas, nivel_experiencia 
            } = req.body;

            // Manejo de preferencias (JSON)
            let preferencias = null;
            if (req.body.preferencias) {
                try {
                    preferencias = typeof req.body.preferencias === 'string' 
                        ? JSON.parse(req.body.preferencias) 
                        : req.body.preferencias;
                } catch (e) {
                    preferencias = null;
                }
            }

            let foto_url = null;

            // Procesamiento de imagen de perfil
            if (req.files && req.files.foto) {
                const archivo = req.files.foto;
                const extension = path.extname(archivo.name);
                const nombreArchivo = `perfil_${id_usuario}_${Date.now()}${extension}`;
                
                const rutaGuardado = path.join(process.cwd(), 'uploads/perfiles', nombreArchivo);
                await archivo.mv(rutaGuardado);
                
                foto_url = `/uploads/perfiles/${nombreArchivo}`;
            }

            // Encriptar nueva contraseña si se proporcionó una
            let passwordHashed = null;
            if (password && password.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                passwordHashed = await bcrypt.hash(password, salt);
            }

            // Actualización mediante el Modelo
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
                message: "¡Perfil actualizado correctamente!",
                user: usuarioActualizado
            });

        } catch (error) {
            console.error("Error en actualizarPerfil:", error);
            res.status(500).json({ message: "Error interno al actualizar el perfil" });
        }
    }
};

module.exports = userController;