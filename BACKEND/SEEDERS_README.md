# 🌱 Sistema de Seeders - Turismo ISTPET

## Descripción
Este sistema de seeders automatiza la inserción de datos iniciales en la base de datos PostgreSQL cuando se despliega en un nuevo computador. Incluye 10+ registros por cada tabla para proporcionar una experiencia completa desde el inicio.

## 📊 Datos Insertados

- **10 Categorías** (Aventura, Relax, Cultural, Ecoturismo, etc.)
- **10 Hoteles** (Distribuidos en ciudades principales)
- **20+ Usuarios** (Administradores, Guías y Turistas)
- **10 Guías** (Asignados a hoteles con especialidades)
- **10 Tours** (Con relaciones a categorías y hoteles)
- **10 Reservas** (Con diferentes estados)
- **10 Pagos** (Simulados con transacciones PayPal)
- **10 Registros de Seguimiento** (De guías y tours)

## 🚀 Cómo Usar

### Opción 1: Ejecutar el seed automáticamente
```bash
cd BACKEND
npm install
npm run seed
```

### Opción 2: Setup completo (instalar + seed)
```bash
cd BACKEND
npm run setup
```

### Opción 3: Ejecución manual
```bash
cd BACKEND/src/seeders
node index.js
```

## 📋 Proceso de Despliegue Completo

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd turismo-istpet
   ```

2. **Configurar variables de entorno** (`.env`)
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=DB_Turismo_C
   DB_USER=postgres
   DB_PASS=1234
   ```

3. **Instalar dependencias del backend**
   ```bash
   cd BACKEND
   npm install
   ```

4. **Crear la base de datos** (si no existe)
   ```bash
   createdb DB_Turismo_C
   ```

5. **Ejecutar migraciones** (crear tablas)
   ```bash
   psql -U postgres -d DB_Turismo_C -f ../script_base_de_datos.sql
   ```

6. **Ejecutar seeders** (cargar datos iniciales)
   ```bash
   npm run seed
   ```

7. **Iniciar el servidor**
   ```bash
   npm run dev
   ```

## 🔐 Credenciales de Prueba

### Administrador
- **Email**: `admin@toursystem.com`
- **Contraseña**: `Admin123!`

### Guía
- **Email**: `jose.guia@toursystem.com`
- **Contraseña**: `Pass123!`

### Turista
- **Email**: `robert.johnson@email.com`
- **Contraseña**: `Pass123!`

## 📝 Notas Importantes

- Los seeders pueden ejecutarse múltiples veces sin causar errores (usan `ON CONFLICT DO NOTHING`)
- Las contraseñas en la BD son de prueba y deben ser actualizadas en producción
- Los datos generados son ficticios y solo para demostración
- Las coordenadas (latitud/longitud) son reales para los hoteles
- Los emails deben ser únicos (ya están validados en la BD)

## ⚠️ Advertencias de Producción

1. **Cambiar credenciales por defecto** antes de ir a producción
2. **Actualizar contraseñas** en la base de datos
3. **Verificar permisos de usuario** en PostgreSQL
4. **Realizar backup** antes de ejecutar migraciones
5. **Revisar datos** antes de sincronizar con producción

## 🆘 Troubleshooting

### Error: "ECONNREFUSED" (Conexión rechazada)
- Verificar que PostgreSQL esté corriendo
- Revisar credenciales en `.env`
- Comprobar que el puerto 5432 esté abierto

### Error: "ya existe relación" (tables already exist)
- La BD ya tiene tablas. Options:
  - Ejecutar nuevamente el seed (usa `ON CONFLICT DO NOTHING`)
  - Borrar la BD: `dropdb DB_Turismo_C`
  - Recrear: `createdb DB_Turismo_C`

### Error: "falta dependencia"
```bash
npm install
npm run seed
```

## 📚 Estructura de Archivos

```
BACKEND/
  src/
    seeders/
      index.js                    # Archivo principal del seed
      database.seeder.js          # Lógica de inserción de datos
    config/
      db.js                       # Configuración de BD
    index.js                      # Servidor principal
  package.json                    # Scripts y dependencias
```

## 📞 Soporte

Para problemas o sugerencias sobre los seeders, contacta al equipo de desarrollo.
