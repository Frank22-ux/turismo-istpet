const pool = require('c:\\Users\\crist\\OneDrive\\Documentos\\Biblioteca\\FILEs\\Paid\\turismo-istpet\\BACKEND\\src\\config\\db');

(async () => {
    try {
        const query = `
            SELECT t.*, 
                   u.primer_nombre as nombre_guia, 
                   u.apellido_paterno as apellido_guia,
                   h.nombre as nombre_hotel
            FROM tours t
            LEFT JOIN usuarios u ON t.id_guia = u.id_usuario
            LEFT JOIN hoteles h ON t.id_hotel_base = h.id_hotel
            ORDER BY t.id_tour DESC
        `;
        const { rows } = await pool.query(query);
        console.log("Success:", rows.length);
    } catch (e) {
        console.error("ERROR:", e.message);
    }
    process.exit(0);
})();
