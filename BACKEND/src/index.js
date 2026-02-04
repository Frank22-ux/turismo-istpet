const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config(); 

const app = express();

// 1. Middlewares
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ 
    createParentPath: true,
    useTempFiles: false 
}));

// Servir la carpeta de subidas de forma estática
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 2. Importación de Rutas
const authRoutes = require('./modules/auth/auth.routes'); 
const tourRoutes = require('./modules/tours/tour.routes'); 
const userRoutes = require('./modules/usuarios/user.routes'); 
const hotelRoutes = require('./modules/hoteles/hotel.routes'); 

// CORRECCIÓN AQUÍ: Se añade la 's' para que coincida exactamente con el nombre del archivo físico
const reservasRoutes = require('./modules/reservas/reservas.routes'); 

// 3. Registro de Rutas API
app.use('/api/auth', authRoutes);     
app.use('/api/tours', tourRoutes);    
app.use('/api/usuarios', userRoutes); 
app.use('/api/hoteles', hotelRoutes); 
app.use('/api/reservas', reservasRoutes); // Vinculación corregida

// Ruta de prueba global
app.get('/test-directo', (req, res) => res.json({ 
    status: "ok", 
    message: "Servidor TravelExplor activo y rutas de reservas vinculadas" 
}));

// 4. Configuración del Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
    console.log(`✅ Rutas de reservas activadas en /api/reservas`);
    console.log(`📸 Imágenes disponibles en: http://localhost:${PORT}/uploads`);
});