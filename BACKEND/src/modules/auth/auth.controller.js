const User = require('../usuarios/user.model');
const PasswordReset = require('./password-reset.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal_desarrollo';

const AuthController = {

    // REGISTRO BLINDADO 🛡️
    register: async (req, res) => {
        try {
            const {
                primer_nombre, segundo_nombre,
                apellido_paterno, apellido_materno,
                cedula, correo, password,
                codigo_pais, numero_celular,
                id_rol
            } = req.body;

            // --- LIMPIAR DATOS (trim) ---
            const cleanCorreo = correo?.trim().toLowerCase();
            const cleanPassword = password?.trim();
            const cleanNombre = primer_nombre?.trim();
            const cleanApellido = apellido_paterno?.trim();
            const cleanCedula = cedula?.trim();
            const cleanCodigoPais = codigo_pais?.trim();
            const cleanCelular = numero_celular?.trim();

            // --- 1. VALIDACIÓN DE CAMPOS VACÍOS ---
            const requiredFields = [
                { key: 'primer_nombre', val: cleanNombre, label: 'Nombre' },
                { key: 'apellido_paterno', val: cleanApellido, label: 'Apellido' },
                { key: 'cedula', val: cleanCedula, label: 'Cédula' },
                { key: 'correo', val: cleanCorreo, label: 'Correo' },
                { key: 'password', val: cleanPassword, label: 'Contraseña' },
                { key: 'codigo_pais', val: cleanCodigoPais, label: 'Código de País' },
                { key: 'numero_celular', val: cleanCelular, label: 'Número Celular' }
            ];

            const missingField = requiredFields.find(f => !f.val);
            if (missingField) {
                const missing = { cleanNombre, cleanApellido, cleanCorreo, cleanCedula, cleanCodigoPais, cleanCelular };
                const logMsg = `[${new Date().toISOString()}] Registro fallido (400): Falta campo ${missingField.label}\n`;
                const fs = require('fs');
                const path = require('path');
                fs.appendFileSync(path.join(process.cwd(), 'errors.log'), logMsg);
                console.warn(`⚠️ Registro fallido: Falta ${missingField.label}`);
                return res.status(400).json({ message: `El campo '${missingField.label}' es obligatorio.` });
            }

            // --- 2. VALIDACIÓN DE ROL ---
            const validRoles = [2, 3];
            const roleToAssign = id_rol && validRoles.includes(parseInt(id_rol))
                ? parseInt(id_rol)
                : 3;

            // --- 3. VALIDACIÓN DE FORMATO DE CORREO ---
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailRegex.test(cleanCorreo)) {
                const logMsg = `[${new Date().toISOString()}] Registro fallido (400): Formato de correo inválido: ${cleanCorreo}\n`;
                const fs = require('fs');
                const path = require('path');
                fs.appendFileSync(path.join(process.cwd(), 'errors.log'), logMsg);
                console.warn("⚠️ Registro fallido: Formato de correo inválido", cleanCorreo);
                return res.status(400).json({ message: 'El formato del correo electrónico no es válido.' });
            }

            // --- 4. VALIDACIÓN DE CONTRASEÑA ---
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!passwordRegex.test(cleanPassword)) {
                const logMsg = `[${new Date().toISOString()}] Registro fallido (400): Contraseña débil\n`;
                const fs = require('fs');
                const path = require('path');
                fs.appendFileSync(path.join(process.cwd(), 'errors.log'), logMsg);
                console.warn("⚠️ Registro fallido: Contraseña débil");
                return res.status(400).json({
                    message: 'La contraseña es muy débil. Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.'
                });
            }

            // --- 5. VALIDAR SI YA EXISTE CORREO O CÉDULA ---
            const existingUser = await User.findByEmail(cleanCorreo);
            if (existingUser) {
                return res.status(400).json({ message: 'El correo ya está registrado' });
            }
            
            const existingCedula = await pool.query('SELECT id_usuario FROM usuarios WHERE cedula = $1', [cleanCedula]);
            if (existingCedula.rows.length > 0) {
                return res.status(400).json({ message: 'La cédula ingresada ya se encuentra registrada.' });
            }

            // --- 6. ENCRIPTAR Y CREAR ---
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(cleanPassword, salt);

            const newUser = await User.create({
                primer_nombre: cleanNombre,
                segundo_nombre: segundo_nombre?.trim() || null,
                apellido_paterno: cleanApellido,
                apellido_materno: apellido_materno?.trim() || null,
                cedula: cleanCedula,
                correo: cleanCorreo,
                password: hashedPassword,
                codigo_pais: codigo_pais?.trim() || '+593',
                numero_celular: numero_celular?.trim() || null,
                id_rol: roleToAssign
            });

            // Mapeo para el frontend
            const userResponse = { ...newUser, rol: roleToAssign };

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: userResponse
            });

        } catch (error) {
            console.error('❌ Error en registro:', error);
            
            // Manejar error de Cédula Duplicada (PostgreSQL unique constraint)
            if (error.code === '23505' && error.constraint === 'usuarios_cedula_key') {
                return res.status(400).json({ message: 'La cédula ingresada ya se encuentra registrada en el sistema.' });
            }

            const fs = require('fs');
            const path = require('path');
            const logMsg = `[${new Date().toISOString()}] Error en Registro: ${error.stack || error.message}\n`;
            fs.appendFileSync(path.join(process.cwd(), 'errors.log'), logMsg);
            res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    },

    // INICIO DE SESIÓN
    login: async (req, res) => {
        try {
            const { correo, password } = req.body;

            // --- LIMPIAR DATOS (trim) ---
            const cleanCorreo = correo?.trim().toLowerCase();
            const cleanPassword = password?.trim();

            // Validación rápida de formato antes de consultar BD (Ahorra recursos)
            if (!cleanCorreo || !cleanPassword) {
                return res.status(400).json({ message: 'Ingrese correo y contraseña' });
            }

            const user = await User.findByEmail(cleanCorreo);
            if (!user) {
                return res.status(400).json({ message: 'Credenciales inválidas' });
            }

            // Comparar contraseña (bcrypt lo hace de forma segura)
            const isMatch = await bcrypt.compare(cleanPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                {
                    id: user.id_usuario,
                    rol: user.id_rol,
                    nombre: user.primer_nombre
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            delete user.password;

            // Devolver rol O id_rol para compatibilidad
            const userResponse = {
                ...user,
                rol: user.id_rol
            };

            res.json({
                message: 'Bienvenido',
                token,
                user: userResponse
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // SOLICITAR RESET DE CONTRASEÑA
    forgotPassword: async (req, res) => {
        try {
            const { correo } = req.body;

            // Validar que el correo sea proporcionado
            if (!correo || !correo.trim()) {
                return res.status(400).json({ message: 'Ingrese un correo válido' });
            }

            const cleanCorreo = correo.trim().toLowerCase();

            // Buscar usuario
            const user = await User.findByEmail(cleanCorreo);
            if (!user) {
                // Por seguridad, no revelar si el email existe o no
                return res.status(200).json({
                    message: 'Si el correo existe, recibirás un enlace para resetear tu contraseña'
                });
            }

            // Crear token de reset
            const resetToken = await PasswordReset.createResetToken(user.id_usuario);

            // TODO: En producción, enviar email con el enlace
            // Por ahora, devolvemos el token para desarrollo/testing
            const resetLink = `http://localhost:5173/reset-password/${resetToken.token}`;

            console.log('🔐 Token de reset generado:', resetToken.token);
            console.log('📧 Enlace para resetear (desarrollo):', resetLink);

            res.status(200).json({
                message: 'Revisa tu correo para resetear la contraseña',
                // En desarrollo, también devolvemos el token para testing
                token: resetToken.token,
                resetLink: resetLink
            });

        } catch (error) {
            console.error('Error en forgotPassword:', error);
            res.status(500).json({ message: 'Error al procesar solicitud' });
        }
    },

    // VERIFICAR SESIÓN/TOKEN
    verify: async (req, res) => {
        try {
            // req.user viene del middleware verifyToken
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            delete user.password;

            const userResponse = {
                ...user,
                rol: user.id_rol
            };

            res.json({
                message: 'Sesión válida',
                token: null, // El token ya existe en el cliente
                user: userResponse
            });

        } catch (error) {
            console.error('Error en verify:', error);
            res.status(401).json({ message: 'Sesión inválida' });
        }
    },

    // CERRAR SESIÓN
    logout: async (req, res) => {
        try {
            // En este caso, el logout ocurre en el frontend (localStorage)
            // El backend solo confirma que el logout fue procesado
            res.json({
                message: 'Sesión cerrada correctamente'
            });

        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({ message: 'Error al cerrar sesión' });
        }
    },

    // RESETEAR CONTRASEÑA
    resetPassword: async (req, res) => {
        try {
            const { token, newPassword, confirmPassword } = req.body;

            // Validar campos
            if (!token || !newPassword || !confirmPassword) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'Las contraseñas no coinciden' });
            }

            // Limpiar contraseña
            const cleanPassword = newPassword.trim();

            // Validar que la contraseña sea fuerte
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!passwordRegex.test(cleanPassword)) {
                return res.status(400).json({
                    message: 'La contraseña debe tener: Mínimo 8 caracteres, 1 Mayúscula, 1 Número y 1 Caracter Especial'
                });
            }

            // Validar token
            const resetRecord = await PasswordReset.validateToken(token);
            if (!resetRecord) {
                return res.status(400).json({
                    message: 'El enlace de reset ha expirado o no es válido. Solicita uno nuevo.'
                });
            }

            // Obtener usuario por token
            const user = await PasswordReset.getUserByResetToken(token);
            if (!user) {
                return res.status(400).json({ message: 'Usuario no encontrado' });
            }

            // Encriptar nueva contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(cleanPassword, salt);

            // Actualizar contraseña
            await User.updateProfile(user.id_usuario, { password: hashedPassword });

            // Marcar token como usado
            await PasswordReset.markTokenAsUsed(token);

            res.status(200).json({
                message: '✅ Contraseña actualizada exitosamente. Puedes iniciar sesión con tu nueva contraseña.'
            });

        } catch (error) {
            console.error('Error en resetPassword:', error);
            res.status(500).json({ message: 'Error al resetear contraseña' });
        }
    }
};

module.exports = AuthController;