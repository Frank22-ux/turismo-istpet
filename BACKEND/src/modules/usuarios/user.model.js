const pool = require('../../config/db');

const UserModel = {
    // Buscar usuario por correo (Login)
    async findByEmail(email) {
        const query = 'SELECT * FROM usuarios WHERE correo = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },

    // Buscar usuario por ID (Para cargar el perfil en el Frontend)
    async findById(id) {
        const query = `
            SELECT id_usuario, primer_nombre, segundo_nombre, 
                   apellido_paterno, apellido_materno, correo, 
                   telefono, descripcion_perfil, foto_url 
            FROM usuarios WHERE id_usuario = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear nuevo usuario (Registro)
    async create(user) {
        const {
            primer_nombre, segundo_nombre,
            apellido_paterno, apellido_materno,
            correo, password, telefono, id_rol
        } = user;

        const query = `
            INSERT INTO usuarios (
                primer_nombre, segundo_nombre,
                apellido_paterno, apellido_materno,
                correo, password, telefono, id_rol
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id_usuario, primer_nombre, apellido_paterno, correo, id_rol;
        `;

        const values = [
            primer_nombre, segundo_nombre,
            apellido_paterno, apellido_materno,
            correo, password, telefono, id_rol
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // ACTUALIZAR PERFIL (Soporta cambios parciales, foto y password)
    async updateProfile(id, data) {
        const {
            primer_nombre, segundo_nombre, apellido_paterno, 
            apellido_materno, telefono, descripcion_perfil, 
            foto_url, password
        } = data;

        const query = `
            UPDATE usuarios 
            SET primer_nombre = $1, 
                segundo_nombre = $2, 
                apellido_paterno = $3, 
                apellido_materno = $4, 
                telefono = $5, 
                descripcion_perfil = $6,
                foto_url = COALESCE($7, foto_url),
                password = COALESCE($8, password)
            WHERE id_usuario = $9
            RETURNING id_usuario, primer_nombre, foto_url;
        `;

        const values = [
            primer_nombre, segundo_nombre, apellido_paterno, 
            apellido_materno, telefono, descripcion_perfil, 
            foto_url, // Si viene null, COALESCE deja la que ya estaba
            password, // Si viene null, COALESCE deja la que ya estaba
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }
};

module.exports = UserModel;