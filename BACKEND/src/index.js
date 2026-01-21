const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');

const app = express();

// 1. Middlewares (INDISPENSABLES para Login y Fotos)
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ createParentPath: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 2. Importación de Rutas
const authRoutes = require('./modules/auth/auth.routes'); 
const tourRoutes = require('./modules/tours/tour.routes'); 
// --- CORRECCIÓN: IMPORTAR LA RUTA DE USUARIOS ---
const userRoutes = require('./modules/usuarios/user.routes'); 

// 3. Registro de Rutas API
app.use('/api/auth', authRoutes);   // Ruta para Login/Registro
app.use('/api/tours', tourRoutes);  // Ruta para los Tours
app.use('/api/usuarios', userRoutes); // <--- Ahora sí funcionará

// Ruta de prueba global
app.get('/test-directo', (req, res) => res.json({ status: "ok" }));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});