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
                   apellido_paterno, apellido_materno, cedula, correo, 
                   codigo_pais, numero_celular, descripcion_perfil, 
                   foto_url, portada_url, id_rol 
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
            cedula, correo, password, codigo_pais, numero_celular, id_rol,
            foto_url, portada_url
        } = user;

        const query = `
            INSERT INTO usuarios (
                primer_nombre, segundo_nombre,
                apellido_paterno, apellido_materno,
                cedula, correo, password, codigo_pais, numero_celular, id_rol,
                foto_url, portada_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id_usuario, primer_nombre, apellido_paterno, correo, id_rol, foto_url, portada_url;
        `;

        const values = [
            primer_nombre, segundo_nombre,
            apellido_paterno, apellido_materno,
            cedula, correo, password, codigo_pais, numero_celular, id_rol,
            foto_url || null,
            portada_url || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // ACTUALIZAR PERFIL (Soporta cambios parciales, foto, portada y password)
    async updateProfile(id, data) {
        const {
            primer_nombre, segundo_nombre, apellido_paterno,
            apellido_materno, codigo_pais, numero_celular, descripcion_perfil,
            foto_url, portada_url, password
        } = data;

        const query = `
            UPDATE usuarios 
            SET primer_nombre = $1, 
                segundo_nombre = $2, 
                apellido_paterno = $3, 
                apellido_materno = $4, 
                codigo_pais = $5, 
                numero_celular = $6, 
                descripcion_perfil = $7,
                foto_url = COALESCE($8, foto_url),
                portada_url = COALESCE($9, portada_url),
                password = COALESCE($10, password)
            WHERE id_usuario = $11
            RETURNING id_usuario, primer_nombre, foto_url, portada_url;
        `;

        const values = [
            primer_nombre, segundo_nombre, apellido_paterno,
            apellido_materno, codigo_pais, numero_celular, descripcion_perfil,
            foto_url, // Si viene null, COALESCE deja la que ya estaba
            portada_url, // Si viene null, COALESCE deja la que ya estaba
            password, // Si viene null, COALESCE deja la que ya estaba
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // ACTUALIZAR USUARIO (Genérico)
    async update(id, data) {
        const {
            primer_nombre, segundo_nombre, apellido_paterno,
            apellido_materno, correo, codigo_pais, numero_celular, foto_url, password
        } = data;

        const query = `
            UPDATE usuarios 
            SET primer_nombre = $1, 
                segundo_nombre = $2, 
                apellido_paterno = $3, 
                apellido_materno = $4, 
                correo = $5,
                codigo_pais = $6, 
                numero_celular = $7,
                foto_url = COALESCE($8, foto_url),
                password = COALESCE($9, password)
            WHERE id_usuario = $10
            RETURNING *;
        `;

        const values = [
            primer_nombre, segundo_nombre, apellido_paterno,
            apellido_materno, correo, codigo_pais, numero_celular,
            foto_url, password || null, id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // ELIMINAR USUARIO
    async delete(id) {
        const query = 'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

module.exports = UserModel;