const jwt = require('jsonwebtoken');

// Este middleware protegerá tus rutas
const verifyToken = (req, res, next) => {
    // 1. Obtener el token del encabezado 'Authorization'
    const authHeader = req.headers['authorization'];
    
    // El formato suele ser "Bearer token_aqui"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            message: "Acceso denegado. No se encontró un token de sesión." 
        });
    }

    try {
        // 2. Verificar el token usando tu clave secreta
        // Asegúrate que 'JWT_SECRET' sea la misma que usaste en el login
        const secret = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';
        const decoded = jwt.verify(token, secret);
        
        // 3. Inyectar los datos del usuario en la petición (req)
        // Esto es lo que permite que el controller use req.user.id
        req.user = decoded; 
        
        next(); // Continuar al siguiente paso (el controlador)
    } catch (error) {
        return res.status(403).json({ 
            message: "Sesión expirada o token inválido." 
        });
    }
};

module.exports = { verifyToken };