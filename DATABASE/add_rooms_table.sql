-- Add table for hotel rooms
CREATE TABLE IF NOT EXISTS hotel_habitaciones (
    id_habitacion SERIAL PRIMARY KEY,
    id_hotel INTEGER NOT NULL REFERENCES hoteles(id_hotel) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio DECIMAL(10, 2) NOT NULL
);

-- Ensure hoteles table has all necessary columns (they should be there based on current research, but adding as a safety measure for the new schema)
-- No major changes needed to 'hoteles' itself based on current db.sql, 
-- but we might want to ensure 'habitaciones' column is not used if we use the new table.
-- However, we'll keep it for now for compatibility and focus on the new table.
