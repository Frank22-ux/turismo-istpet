const pool = require('../config/db');

const seedDatabase = async () => {
    try {
        console.log('🌱 Iniciando inserción de datos iniciales...\n');

        // ============================================
        // 1. INSERTAR ROLES (si no existen)
        // ============================================
        console.log('📝 Insertando roles...');
        await pool.query(`
            INSERT INTO roles (nombre_rol) 
            VALUES ('Administrador'), ('Guía'), ('Turista')
            ON CONFLICT (nombre_rol) DO NOTHING;
        `);
        console.log('✅ Roles completados\n');

        // ============================================
        // 2. INSERTAR CATEGORÍAS
        // ============================================
        console.log('📝 Insertando categorías...');
        const categorias = [
            ('Aventura', '🏃', 'Tours llenos de adrenalina y actividades extremas'),
            ('Relax', '☀️', 'Descanso y relajación en paradisíacos lugares'),
            ('Cultural', '🏛️', 'Conoce la historia y tradiciones locales'),
            ('Ecoturismo', '🌿', 'Tours sostenibles en contacto con la naturaleza'),
            ('Gastronómica', '🍽️', 'Experimenta la gastronomía local'),
            ('Aventura Acuática', '🏄', 'Deportes y actividades en el agua'),
            ('Montaña', '⛰️', 'Expediciones y senderismo en altura'),
            ('Playa', '🏖️', 'Diversión y descanso en las playas'),
            ('Turismo Rural', '🚜', 'Experiencias auténticas en zonas rurales'),
            ('Vida Salvaje', '🦁', 'Avistamiento de fauna y flora silvestre')
        ];
        
        for (const [nombre, icono, desc] of categorias) {
            await pool.query(
                `INSERT INTO categorias (nombre_categoria, icono_url, descripcion)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (nombre_categoria) DO NOTHING;`,
                [nombre, icono, desc]
            );
        }
        console.log('✅ Categorías completadas\n');

        // ============================================
        // 3. INSERTAR HOTELES
        // ============================================
        console.log('📝 Insertando hoteles...');
        const hoteles = [
            ('Hotel Gran Amazonas', 'Calle Principal 123, Quito', 'Quito', -0.22055, -78.50949, 'Activo', 'Hotel de lujo en el corazón de Quito'),
            ('Eco Hotel Galápagos', 'Av. Darwin 456, Santa Cruz', 'Galápagos', -0.73753, -90.28325, 'Activo', 'Hospedaje ecológico en las Galápagos'),
            ('Resort Playas del Pacífico', 'Km 2 vía Salinas', 'Salinas', -2.21359, -80.96764, 'Activo', 'Resort frente al mar con todas las comodidades'),
            ('Hotel Andino Cuenca', 'Calle Larga 789, Cuenca', 'Cuenca', -2.89084, -78.98448, 'Activo', 'Hotel boutique en el corazón de Cuenca'),
            ('Jungle Lodge Orellana', 'Río Napo, Orellana', 'Francisco de Orellana', -0.94653, -75.74275, 'Activo', 'Lodge en la selva amazónica'),
            ('Hotel Mar y Sol', 'Malecón 321, Manta', 'Manta', -0.95164, -80.73645, 'Activo', 'Hotel costero con vistas al océano'),
            ('Hostal Andino Otavalo', 'Plaza de Ponchos, Otavalo', 'Otavalo', 0.42274, -78.26389, 'Activo', 'Alojamiento tradicional en Otavalo'),
            ('Resort Baños Adventure', 'Calle Ambato 654, Baños', 'Baños de Agua Santa', -1.39719, -78.42466, 'Activo', 'Resort de aventura en Baños'),
            ('Hotel Riobamba Royal', 'Av. León Borja, Riobamba', 'Riobamba', -1.66709, -78.64716, 'Activo', 'Hotel de negocio en los Andes'),
            ('Casa del Árbol Lodge', 'Calle Latacunga, Latacunga', 'Latacunga', -0.93219, -78.60758, 'Activo', 'Cabaña ecológica cerca del volcán Cotopaxi')
        ];

        for (const [nom, dir, ciudad, lat, lon, estado, desc] of hoteles) {
            await pool.query(
                `INSERT INTO hoteles (nombre, direccion, ciudad, latitud, longitud, estado_convenio, descripcion)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT DO NOTHING;`,
                [nom, dir, ciudad, lat, lon, estado, desc]
            );
        }
        console.log('✅ Hoteles completados\n');

        // ============================================
        // 4. INSERTAR USUARIOS (ADMINISTRADORES Y GUÍAS)
        // ============================================
        console.log('📝 Insertando usuarios...');
        
        // Obtenemos los IDs de roles
        const rolesResult = await pool.query(`
            SELECT id_rol, nombre_rol FROM roles
        `);
        const roles = {};
        rolesResult.rows.forEach(r => {
            roles[r.nombre_rol] = r.id_rol;
        });

        // Obtenemos los IDs de hoteles
        const hotelResult = await pool.query(`SELECT id_hotel FROM hoteles LIMIT 10`);
        const hotelIds = hotelResult.rows.map(h => h.id_hotel);

        // Insertar administradores
        const admins = [
            ('Super', 'Admin', 'Sistema', 'Principal', 'admin@toursystem.com', 'Admin123!', '+593 987654321', 'Administrador Principal'),
            ('Carlos', 'David', 'García', 'López', 'carlos.admin@toursystem.com', 'Pass123!', '+593 987654322', 'Administrador de Operaciones'),
            ('María', 'Elena', 'Rodríguez', 'Martínez', 'maria.admin@toursystem.com', 'Pass123!', '+593 987654323', 'Administrador de Finanzas'),
            ('Juan', 'Carlos', 'Pérez', 'González', 'juan.admin@toursystem.com', 'Pass123!', '+593 987654324', 'Administrador de RRHH'),
            ('Patricia', 'Luz', 'Fernández', 'Silva', 'patricia.admin@toursystem.com', 'Pass123!', '+593 987654325', 'Administrador de Marketing'),
            ('Roberto', 'Francisco', 'Hernández', 'Ruiz', 'roberto.admin@toursystem.com', 'Pass123!', '+593 987654326', 'Administrador Técnico'),
            ('Lorena', 'Mariana', 'Jiménez', 'Castro', 'lorena.admin@toursystem.com', 'Pass123!', '+593 987654327', 'Coordinadora de Eventos'),
            ('Miguel', 'Ángel', 'Sánchez', 'Díaz', 'miguel.admin@toursystem.com', 'Pass123!', '+593 987654328', 'Gestor de Reservas'),
            ('Andrea', 'Sofía', 'Morales', 'Gutiérrez', 'andrea.admin@toursystem.com', 'Pass123!', '+593 987654329', 'Administrador de Calidad'),
            ('Fernando', 'Luis', 'Torres', 'Vega', 'fernando.admin@toursystem.com', 'Pass123!', '+593 987654330', 'Director Operacional')
        ];

        for (const [nom1, nom2, ape1, ape2, email, pass, tel, desc] of admins) {
            await pool.query(
                `INSERT INTO usuarios (primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, correo, password, id_rol, telefono, descripcion_perfil)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (correo) DO NOTHING;`,
                [nom1, nom2, ape1, ape2, email, pass, roles['Administrador'], tel, desc]
            );
        }

        // Insertar guías
        const guias = [
            ('José', 'María', 'Inca', 'Flores', 'jose.guia@toursystem.com', 'Pass123!', '+593 987654331', 'Guía especializado en culturales'),
            ('Alejandra', 'Patricia', 'Montoya', 'Soto', 'alejandra.guia@toursystem.com', 'Pass123!', '+593 987654332', 'Guía de aventura'),
            ('Marco', 'Antonio', 'Vargas', 'Acosta', 'marco.guia@toursystem.com', 'Pass123!', '+593 987654333', 'Experto en senderismo'),
            ('Daniela', 'Carolina', 'Espinosa', 'Maldonado', 'daniela.guia@toursystem.com', 'Pass123!', '+593 987654334', 'Guía de turismo ecológico'),
            ('Pedro', 'Luis', 'Zambrano', 'Cordero', 'pedro.guia@toursystem.com', 'Pass123!', '+593 987654335', 'Especialista en tours gastronómicos'),
            ('Sofía', 'Valentina', 'Reyes', 'Carrillo', 'sofia.guia@toursystem.com', 'Pass123!', '+593 987654336', 'Guía de playa y actividades acuáticas'),
            ('Ricardo', 'Emilio', 'Bravo', 'Navarro', 'ricardo.guia@toursystem.com', 'Pass123!', '+593 987654337', 'Montañero profesional'),
            ('Catalina', 'Beatriz', 'Vera', 'Palacios', 'catalina.guia@toursystem.com', 'Pass123!', '+593 987654338', 'Historiadora y guía cultural'),
            ('Andrés', 'Sergio', 'Contreras', 'Medina', 'andres.guia@toursystem.com', 'Pass123!', '+593 987654339', 'Biólogo - Vida Salvaje'),
            ('Valentina', 'Irene', 'Salazar', 'Benítez', 'valentina.guia@toursystem.com', 'Pass123!', '+593 987654340', 'Guía rural y ecoturismo')
        ];

        for (const [nom1, nom2, ape1, ape2, email, pass, tel, desc] of guias) {
            await pool.query(
                `INSERT INTO usuarios (primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, correo, password, id_rol, telefono, descripcion_perfil)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (correo) DO NOTHING;`,
                [nom1, nom2, ape1, ape2, email, pass, roles['Guía'], tel, desc]
            );
        }

        // Insertar turistas
        const turistas = [
            ('Robert', 'Michael', 'Johnson', 'Smith', 'robert.johnson@email.com', 'Pass123!', '+1 987654321', 'Viajero experimentado'),
            ('Emma', 'Louise', 'Williams', 'Brown', 'emma.williams@email.com', 'Pass123!', '+1 987654322', 'Amante de la naturaleza'),
            ('Lukas', 'Peter', 'Mueller', 'Weber', 'lukas.mueller@email.com', 'Pass123!', '+49 987654323', 'Fotógrafo de viajes'),
            ('Sophie', 'Marie', 'Dubois', 'Martin', 'sophie.dubois@email.com', 'Pass123!', '+33 987654324', 'Gourmette'),
            ('Juan', 'Pablo', 'González', 'Rodríguez', 'juan.gonzalez@email.com', 'Pass123!', '+34 987654325', 'Viajero aventurero'),
            ('Laura', 'Martina', 'Rossi', 'Ferrari', 'laura.rossi@email.com', 'Pass123!', '+39 987654326', 'Viajera de mochila'),
            ('Hans', 'Wilhelm', 'Schmidt', 'Hoffmann', 'hans.schmidt@email.com', 'Pass123!', '+41 987654327', 'Montañero'),
            ('Isabelle', 'Antoinette', 'Laurent', 'Moreau', 'isabelle.laurent@email.com', 'Pass123!', '+33 987654328', 'Historiadora apasionada'),
            ('Miguel', 'Ángel', 'López', 'García', 'miguel.lopez@email.com', 'Pass123!', '+34 987654329', 'Explorador'),
            ('Catherine', 'Anna', 'Clarke', 'Davies', 'catherine.clarke@email.com', 'Pass123!', '+44 987654330', 'Fotógrafa profesional')
        ];

        const usuariosResult = [];
        for (const [nom1, nom2, ape1, ape2, email, pass, tel, desc] of turistas) {
            const result = await pool.query(
                `INSERT INTO usuarios (primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, correo, password, id_rol, telefono, descripcion_perfil)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (correo) DO NOTHING
                 RETURNING id_usuario;`,
                [nom1, nom2, ape1, ape2, email, pass, roles['Turista'], tel, desc]
            );
            if (result.rows.length > 0) {
                usuariosResult.push(result.rows[0].id_usuario);
            }
        }
        console.log('✅ Usuarios completados\n');

        // ============================================
        // 5. INSERTAR GUÍAS (RELACIÓN CON USUARIOS)
        // ============================================
        console.log('📝 Insertando relación guías-usuarios...');
        
        const guiasResult = await pool.query(`
            SELECT u.id_usuario FROM usuarios u 
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE r.nombre_rol = 'Guía'
            LIMIT 10
        `);

        for (let i = 0; i < guiasResult.rows.length; i++) {
            const hotelIdx = i < hotelIds.length ? i : i % hotelIds.length;
            await pool.query(
                `INSERT INTO guias (id_usuario, id_hotel_asignado, especialidad)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (id_usuario) DO NOTHING;`,
                [guiasResult.rows[i].id_usuario, hotelIds[hotelIdx], `Especialidad ${i + 1}`]
            );
        }
        console.log('✅ Guías completados\n');

        // ============================================
        // 6. INSERTAR TOURS
        // ============================================
        console.log('📝 Insertando tours...');
        
        const categoriasResult = await pool.query(`SELECT id_categoria FROM categorias LIMIT 10`);
        const categoriaIds = categoriasResult.rows.map(c => c.id_categoria);

        const tours = [
            ('Tour Amazónico 3 Días', 'Exploración de la selva amazónica con experiencias únicas', 850.00, 3, 15, 'random', 'random'),
            ('Galápagos Clásico 5 Días', 'Avistamiento de fauna única y playas vírgenes', 2500.00, 5, 10, 'random', 'random'),
            ('Quito Colonial 1 Día', 'Recorrido por el centro histórico de Quito', 120.00, 1, 25, 'random', null),
            ('Montaje de Volcanes 2 Días', 'Escalada del Cotopaxi con guía especializado', 450.00, 2, 8, 'random', 'random'),
            ('Playas Salinas 1 Día', 'Día de playa con almuerzo fresco', 95.00, 1, 30, 'random', null),
            ('Ruta Gastronómica Cuenca 2 Días', 'Experiencia culinaria en la ciudad patrimonial', 380.00, 2, 12, 'random', 'random'),
            ('Trekking Baños 2 Días', 'Senderismo en cascadas y piscinas naturales', 320.00, 2, 16, 'random', 'random'),
            ('Tour Otavalo Artesanal 1 Día', 'Mercado de artesanías y cultura indígena', 110.00, 1, 20, 'random', null),
            ('Jungle Lodge 4 Días', 'Inmersión total en la selva amazónica', 1200.00, 4, 12, 'random', 'random'),
            ('Islas Galápagos - Buceo Avanzado 6 Días', 'Buceo profesional en los arrecifes', 3500.00, 6, 6, 'random', 'random')
        ];

        for (const [nombre, desc, precio, dias, cupo, categ, hotel] of tours) {
            const categId = categoriasResult.rows[Math.floor(Math.random() * categoriaIds.length)].id_categoria;
            const hotelId = hotel === 'random' ? hotelIds[Math.floor(Math.random() * hotelIds.length)] : null;

            await pool.query(
                `INSERT INTO tours (nombre, descripcion, precio, duracion_dias, cupo_maximo, id_categoria, id_hotel_base)
                 VALUES ($1, $2, $3, $4, $5, $6, $7);`,
                [nombre, desc, precio, dias, cupo, categId, hotelId]
            );
        }
        console.log('✅ Tours completados\n');

        // ============================================
        // 7. INSERTAR RESERVAS
        // ============================================
        console.log('📝 Insertando reservas...');
        
        const toursResult = await pool.query(`SELECT id_tour FROM tours LIMIT 10`);
        const tourIds = toursResult.rows.map(t => t.id_tour);
        
        const turista_ids = [];
        const turResults = await pool.query(`
            SELECT u.id_usuario FROM usuarios u 
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE r.nombre_rol = 'Turista'
            LIMIT 10
        `);
        turResults.rows.forEach(t => turista_ids.push(t.id_usuario));

        const estados = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];
        const fechas = ['2026-03-15', '2026-03-20', '2026-04-01', '2026-04-10', '2026-04-25', '2026-05-05', '2026-05-15', '2026-06-01', '2026-06-10', '2026-06-20'];

        for (let i = 0; i < 10; i++) {
            const turistaIdx = i % turista_ids.length;
            const tourIdx = i % tourIds.length;
            const estado = estados[Math.floor(Math.random() * estados.length)];
            const fecha = fechas[Math.floor(Math.random() * fechas.length)];
            const cantidad = Math.floor(Math.random() * 5) + 1;

            await pool.query(
                `INSERT INTO reservas (id_turista, id_tour, fecha_actividad, cantidad_personas, estado_reserva)
                 VALUES ($1, $2, $3, $4, $5);`,
                [turista_ids[turistaIdx], tourIds[tourIdx], fecha, cantidad, estado]
            );
        }
        console.log('✅ Reservas completadas\n');

        // ============================================
        // 8. INSERTAR PAGOS
        // ============================================
        console.log('📝 Insertando pagos...');
        
        const reservasResult = await pool.query(`SELECT id_reserva FROM reservas LIMIT 10`);
        const reservaIds = reservasResult.rows.map(r => r.id_reserva);
        const estadosPagos = ['COMPLETED', 'PENDING', 'DENIED'];

        for (let i = 0; i < reservaIds.length; i++) {
            const monto = (Math.floor(Math.random() * 3000) + 100);
            const estado = estadosPagos[Math.floor(Math.random() * estadosPagos.length)];
            const referencia = `PAY-${Date.now()}-${i}`;

            await pool.query(
                `INSERT INTO pagos (id_reserva, monto, metodo, referencia_transaccion, estado_paypal)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id_reserva) DO NOTHING;`,
                [reservaIds[i], monto, 'PayPal', referencia, estado]
            );
        }
        console.log('✅ Pagos completados\n');

        // ============================================
        // 9. INSERTAR SEGUIMIENTO DE GUÍAS
        // ============================================
        console.log('📝 Insertando seguimiento de guías...');
        
        const emociones = ['Feliz', 'Neutral', 'Cansado', 'Emocionado', 'Relajado'];
        const comentarios = [
            'Excelente día de trabajo',
            'Turistas muy educados',
            'Buen clima para la actividad',
            'Grupo muy satisfecho',
            'Experiencia enriquecedora'
        ];

        for (let i = 0; i < Math.min(reservaIds.length, guiasResult.rows.length); i++) {
            const satisfaccion = Math.floor(Math.random() * 5) + 1;
            const emocion = emociones[Math.floor(Math.random() * emociones.length)];
            const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];

            await pool.query(
                `INSERT INTO seguimiento_guia (id_reserva, id_guia, estado_animo, satisfaccion_nivel, comentarios)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT DO NOTHING;`,
                [reservaIds[i], guiasResult.rows[i % guiasResult.rows.length].id_usuario, emocion, satisfaccion, comentario]
            );
        }
        console.log('✅ Seguimiento de guías completado\n');

        console.log('🎉 ¡Datos de prueba insertados exitosamente!');
        console.log('📊 Resumen:');
        console.log('   ✓ 10 Categorías');
        console.log('   ✓ 10 Hoteles');
        console.log('   ✓ 20 Usuarios (10 Guías + 10 Turistas + Administradores)');
        console.log('   ✓ 10 Guías');
        console.log('   ✓ 10 Tours');
        console.log('   ✓ 10 Reservas');
        console.log('   ✓ 10 Pagos');
        console.log('   ✓ 10 Registros de Seguimiento\n');

    } catch (error) {
        console.error('❌ Error al insertar datos:', error);
        process.exit(1);
    }
};

module.exports = seedDatabase;
