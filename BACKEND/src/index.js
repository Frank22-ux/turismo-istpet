const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config(); // Para leer las variables del archivo .env

const app = express();

// 1. Middlewares (INDISPENSABLES para Login y Fotos)
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ 
    createParentPath: true,
    useTempFiles: false // Cambiar a true si vas a manejar archivos muy pesados
}));

// Servir la carpeta de subidas de forma estática para que las imágenes sean visibles
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 2. Importación de Rutas
const authRoutes = require('./modules/auth/auth.routes'); 
const tourRoutes = require('./modules/tours/tour.routes'); 
const userRoutes = require('./modules/usuarios/user.routes'); 
const hotelRoutes = require('./modules/hoteles/hotel.routes'); // <--- NUEVA RUTA HOTELES

// 3. Registro de Rutas API
app.use('/api/auth', authRoutes);     // Autenticación
app.use('/api/tours', tourRoutes);    // Gestión de Tours
app.use('/api/usuarios', userRoutes); // Gestión de Usuarios/Perfil
app.use('/api/hoteles', hotelRoutes); // Gestión de Hoteles <--- ACTIVADA

// Ruta de prueba global
app.get('/test-directo', (req, res) => res.json({ status: "ok", message: "Servidor TravelExplor activo" }));

// 4. Configuración del Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
    console.log(`📸 Imágenes disponibles en: http://localhost:${PORT}/uploads`);
});