const User = require('../usuarios/user.model'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal_desarrollo';

const AuthController = {
    
    // REGISTRO BLINDADO 🛡️
    register: async (req, res) => {
        try {
            const { 
                primer_nombre, segundo_nombre, 
                apellido_paterno, apellido_materno, 
                correo, password, telefono 
            } = req.body;

            // --- 1. VALIDACIÓN DE CAMPOS VACÍOS ---
            if (!primer_nombre || !apellido_paterno || !correo || !password) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }

            // --- 2. VALIDACIÓN DE FORMATO DE CORREO (REGEX) ---
            // Acepta letras, números, puntos, guiones, seguido de @, seguido de dominio.
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            
            if (!emailRegex.test(correo)) {
                return res.status(400).json({ 
                    message: 'El formato del correo es inválido (ej: usuario@dominio.com)' 
                });
            }

            // --- 3. VALIDACIÓN DE CONTRASEÑA FUERTE (REGEX) ---
            // Mínimo 8 caracteres
            // Al menos una Mayúscula (?=.*[A-Z])
            // Al menos un Número (?=.*\d)
            // Al menos un Caracter Especial (?=.*[\W_]) (puntos, signos, etc.)
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

            if (!passwordRegex.test(password)) {
                return res.status(400).json({ 
                    message: 'La contraseña es muy débil. Debe tener: Mínimo 8 caracteres, 1 Mayúscula, 1 Número y 1 Caracter Especial (ej: .#$)' 
                });
            }

            // --- 4. VALIDAR SI YA EXISTE (Lógica de Negocio) ---
            const existingUser = await User.findByEmail(correo);
            if (existingUser) {
                return res.status(400).json({ message: 'El correo ya está registrado en el sistema' });
            }

            // --- 5. ENCRIPTAR Y CREAR ---
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Siempre se crea como Turista (id_rol: 3)
            const newUser = await User.create({
                primer_nombre, segundo_nombre,
                apellido_paterno, apellido_materno,
                correo, password: hashedPassword,
                telefono,
                id_rol: 3 
            });

            // Mapeo para el frontend
            const userResponse = { ...newUser, rol: 3 };

            res.status(201).json({ 
                message: 'Usuario registrado exitosamente', 
                user: userResponse 
            });

        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // INICIO DE SESIÓN
    login: async (req, res) => {
        try {
            const { correo, password } = req.body;

            // Validación rápida de formato antes de consultar BD (Ahorra recursos)
            if (!correo || !password) {
                return res.status(400).json({ message: 'Ingrese correo y contraseña' });
            }

            const user = await User.findByEmail(correo);
            if (!user) {
                return res.status(400).json({ message: 'Credenciales inválidas' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
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
    }
};

module.exports = AuthController;