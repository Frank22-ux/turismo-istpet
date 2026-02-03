const pool = require('../../config/db');
const path = require('path');

// 1. LISTAR TODOS LOS GUÍAS (Incluye Nombre del Hotel y todos los apellidos)
const listarGuias = async (req, res) => {
    try {
        const query = `
            SELECT 
                g.id_guia, 
                g.especialidad, 
                u.idiomas, 
                u.primer_nombre, 
                u.segundo_nombre,
                u.apellido_paterno, 
                u.apellido_materno,
                u.correo, 
                u.foto_url, 
                u.activo,
                h.nombre AS nombre_hotel
            FROM guias g
            JOIN usuarios u ON g.id_usuario = u.id_usuario
            LEFT JOIN hoteles h ON g.id_hotel_asignado = h.id_hotel
            ORDER BY u.fecha_registro DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Error al listar guías:", error);
        res.status(500).json({ message: "Error al obtener la lista de guías" });
    }
};

// 2. OBTENER DETALLE POR ID (Corregido con JOIN de hoteles)
const obtenerGuiaPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                g.id_guia, g.especialidad, g.id_hotel_asignado, g.bio,
                u.id_usuario, u.primer_nombre, u.segundo_nombre, 
                u.apellido_paterno, u.apellido_materno, u.correo, u.foto_url, 
                u.idiomas, u.nivel_experiencia, u.telefono, u.activo,
                h.nombre AS nombre_hotel
            FROM guias g
            JOIN usuarios u ON g.id_usuario = u.id_usuario
            LEFT JOIN hoteles h ON g.id_hotel_asignado = h.id_hotel
            WHERE g.id_guia = $1
        `;
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Guía no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener detalle:", error);
        res.status(500).json({ message: "Error al obtener datos del guía" });
    }
};

// 3. REGISTRAR NUEVO GUÍA
const registrarNuevoGuia = async (req, res) => {
    const { 
        primer_nombre, segundo_nombre, apellido_paterno, apellido_materno,
        correo, password, idiomas, nivel_experiencia, especialidad, id_hotel_asignado,
        telefono, bio 
    } = req.body;

    let foto_url = null;
    const client = await pool.connect(); 

    try {
        await client.query('BEGIN');

        if (req.files && req.files.foto) {
            const archivo = req.files.foto;
            const nombreArchivo = `${Date.now()}_${archivo.name}`;
            await archivo.mv(path.join(process.cwd(), 'uploads', nombreArchivo));
            foto_url = `/uploads/${nombreArchivo}`;
        }

        const userResult = await client.query(
            `INSERT INTO usuarios (
                primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, 
                correo, password, id_rol, idiomas, nivel_experiencia, foto_url, telefono
            ) VALUES ($1, $2, $3, $4, $5, $6, 2, $7, $8, $9, $10) RETURNING id_usuario`,
            [
                primer_nombre, 
                segundo_nombre || '', 
                apellido_paterno, 
                apellido_materno || '',
                correo, 
                password, 
                idiomas || '', 
                nivel_experiencia || 'principiante', 
                foto_url, 
                telefono || ''
            ]
        );

        const nuevoIdUsuario = userResult.rows[0].id_usuario;

        await client.query(
            'INSERT INTO guias (id_usuario, especialidad, id_hotel_asignado, bio) VALUES ($1, $2, $3, $4)',
            [nuevoIdUsuario, especialidad, id_hotel_asignado || null, bio || '']
        );

        await client.query('COMMIT');
        res.status(201).json({ message: "Guía creado exitosamente" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al registrar:", error);
        if (error.code === '23505') return res.status(400).json({ message: "El correo ya existe" });
        res.status(500).json({ message: "Error al registrar guía" });
    } finally {
        client.release();
    }
};

// 4. ACTUALIZAR GUÍA
const actualizarGuia = async (req, res) => {
    const { id } = req.params;
    const { 
        primer_nombre, segundo_nombre, apellido_paterno, apellido_materno,
        correo, idiomas, nivel_experiencia, especialidad, id_hotel_asignado,
        telefono, bio 
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const guiaData = await client.query('SELECT id_usuario FROM guias WHERE id_guia = $1', [id]);
        if (guiaData.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Guía no encontrado" });
        }
        
        const idUsuario = guiaData.rows[0].id_usuario;

        // Actualizar tabla Usuarios
        await client.query(
            `UPDATE usuarios SET 
                primer_nombre=$1, segundo_nombre=$2, apellido_paterno=$3, apellido_materno=$4,
                correo=$5, idiomas=$6, nivel_experiencia=$7, telefono=$8
             WHERE id_usuario=$9`,
            [
                primer_nombre, 
                segundo_nombre || '', 
                apellido_paterno, 
                apellido_materno || '', 
                correo, 
                idiomas, 
                nivel_experiencia, 
                telefono || '', 
                idUsuario
            ]
        );

        // Actualizar tabla Guías
        await client.query(
            `UPDATE guias SET especialidad=$1, id_hotel_asignado=$2, bio=$3 WHERE id_guia=$4`,
            [especialidad, id_hotel_asignado || null, bio || '', id]
        );

        await client.query('COMMIT');
        res.json({ message: "Datos actualizados correctamente" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al actualizar:", error);
        res.status(500).json({ message: "Error al actualizar guía" });
    } finally {
        client.release();
    }
};

// 5. ELIMINAR GUÍA
const eliminarGuia = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id_usuario FROM guias WHERE id_guia = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Guía no encontrado" });

        const idUsuario = result.rows[0].id_usuario;
        
        // El DELETE CASCADE debería encargarse de la tabla 'guias'
        await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [idUsuario]);

        res.json({ message: "Guía eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ message: "Error al eliminar el guía" });
    }
};

module.exports = {
    listarGuias,
    obtenerGuiaPorId,
    registrarNuevoGuia,
    actualizarGuia,
    eliminarGuia
};