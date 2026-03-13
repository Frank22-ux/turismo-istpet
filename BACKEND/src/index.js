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
const userRoutes = require('./modules/usuarios/user.routes');
const hotelRoutes = require('./modules/hoteles/hotel.routes');
const guiaRoutes = require('./modules/guias/guia.routes');
const reservaRoutes = require('./modules/reservas/reserva.routes');
const pagoRoutes = require('./modules/pagos/pago.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const resenaRoutes = require('./modules/resenas/resena.routes');
const geocodingRoutes = require('./modules/geocoding/geocoding.routes');

// 3. Registro de Rutas API
app.use('/api/auth', authRoutes);   // Ruta para Login/Registro
app.use('/api/tours', tourRoutes);  // Ruta para los Tours
app.use('/api/usuarios', userRoutes); // Usuarios
app.use('/api/hoteles', hotelRoutes);
app.use('/api/guias', guiaRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', require('./modules/buscador/buscador.routes'));
app.use('/api/favoritos', require('./modules/favoritos/favorito.routes'));
app.use('/api/resenas', resenaRoutes);
app.use('/api/geocoding', geocodingRoutes);

// Ruta de prueba global
app.get('/test-directo', (req, res) => res.json({ status: "ok" }));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});