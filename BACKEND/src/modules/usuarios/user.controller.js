const UserModel = require('./user.model');
const path = require('path');
const bcrypt = require('bcrypt');

const userController = {
    // Obtener perfil actual
    getPerfil: async (req, res) => {
        try {
            // El ID viene del token (JWT) a través del middleware
            const id_usuario = req.user.id;
            const usuario = await UserModel.findById(id_usuario);
            if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener perfil" });
        }
    },

    // Actualizar perfil con foto, portada y password
    actualizarPerfil: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            const {
                primer_nombre, segundo_nombre,
                apellido_paterno, apellido_materno,
                cedula, codigo_pais, numero_celular,
                descripcion_perfil, password
            } = req.body;

            let foto_url = null;
            let portada_url = null;

            // Carpeta base para uploads
            const uploadsBase = path.join(process.cwd(), 'uploads');
            const perfilesDir = path.join(uploadsBase, 'perfiles');
            const portadasDir = path.join(uploadsBase, 'portadas');

            // Asegurar que las carpetas existen
            const fs = require('fs');
            if (!fs.existsSync(perfilesDir)) fs.mkdirSync(perfilesDir, { recursive: true });
            if (!fs.existsSync(portadasDir)) fs.mkdirSync(portadasDir, { recursive: true });

            // 1. Manejo de Foto de Perfil
            if (req.files && req.files.foto) {
                const archivo = req.files.foto;
                const extension = path.extname(archivo.name);
                const nombreArchivo = `perfil_${id_usuario}_${Date.now()}${extension}`;
                await archivo.mv(path.join(perfilesDir, nombreArchivo));
                foto_url = `/uploads/perfiles/${nombreArchivo}`;
            }

            // 2. Manejo de Foto de Portada
            if (req.files && req.files.portada) {
                const archivo = req.files.portada;
                const extension = path.extname(archivo.name);
                const nombreArchivo = `portada_${id_usuario}_${Date.now()}${extension}`;
                await archivo.mv(path.join(portadasDir, nombreArchivo));
                portada_url = `/uploads/portadas/${nombreArchivo}`;
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
                cedula,
                codigo_pais,
                numero_celular,
                descripcion_perfil,
                foto_url,
                portada_url,
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