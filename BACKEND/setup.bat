@echo off
setlocal enabledelayedexpansion

echo.
echo ==========================================
echo 🚀 SETUP TURISMO ISTPET - Backend
echo ==========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado. Por favor instálalo primero.
    exit /b 1
)

REM Verificar si npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no está instalado.
    exit /b 1
)

echo ✅ Node.js y npm encontrados
echo.

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error al instalar dependencias
    exit /b 1
)

echo ✅ Dependencias instaladas
echo.

REM Crear archivo .env si no existe
if not exist .env (
    echo 📝 Creando archivo .env...
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=turismo_db
        echo DB_USER=postgres
        echo DB_PASS=postgres
        echo.
        echo # JWT Secret
        echo JWT_SECRET=your-secret-key-change-in-production
        echo.
        echo # Server Port
        echo PORT=3000
        echo.
        echo # Node Environment
        echo NODE_ENV=development
    ) > .env
    echo ✅ Archivo .env creado (actualiza las credenciales según sea necesario)
) else (
    echo ℹ️  .env ya existe
)

echo.
echo ==========================================
echo ✨ Setup completado
echo ==========================================
echo.
echo Próximos pasos:
echo 1. Actualiza el archivo .env con tus credenciales de BD
echo 2. Ejecuta: npm run seed (para insertar datos iniciales)
echo 3. Ejecuta: npm run dev (para iniciar el servidor)
echo.
pause
