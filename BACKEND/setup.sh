#!/bin/bash

echo ""
echo "=========================================="
echo "🚀 SETUP TURISMO ISTPET - Backend"
echo "=========================================="
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado."
    exit 1
fi

echo "✅ Node.js y npm encontrados"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"
echo ""

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=turismo_db
DB_USER=postgres
DB_PASS=postgres

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Server Port
PORT=3000

# Node Environment
NODE_ENV=development
EOF
    echo "✅ Archivo .env creado (actualiza las credenciales según sea necesario)"
else
    echo "ℹ️  .env ya existe"
fi

echo ""
echo "=========================================="
echo "✨ Setup completado"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. Actualiza el archivo .env con tus credenciales de BD"
echo "2. Ejecuta: npm run seed (para insertar datos iniciales)"
echo "3. Ejecuta: npm run dev (para iniciar el servidor)"
echo ""
