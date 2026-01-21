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

    // Actualizar perfil con foto y password
    actualizarPerfil: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, telefono, descripcion_perfil, password } = req.body;

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