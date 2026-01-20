-- Tabla de asesores comerciales
CREATE TABLE IF NOT EXISTS asesores (
    id_asesor SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    foto_url TEXT,
    calificacion_promedio DECIMAL(2,1) DEFAULT 5.0 CHECK (calificacion_promedio >= 0 AND calificacion_promedio <= 5),
    total_calificaciones INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0, -- Para ordenar cómo aparecen en el carrusel
    especialidad VARCHAR(100), -- Ej: "Motos", "Electrohogar", "Muebles"
    horario_atencion VARCHAR(100), -- Ej: "Lun-Vie 8am-6pm"
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_asesores_activo ON asesores(activo);
CREATE INDEX idx_asesores_orden ON asesores(orden);

-- Comentarios para documentación
COMMENT ON TABLE asesores IS 'Tabla de asesores comerciales para atención al cliente';
COMMENT ON COLUMN asesores.calificacion_promedio IS 'Promedio de calificaciones del asesor (0-5 estrellas)';
COMMENT ON COLUMN asesores.total_calificaciones IS 'Número total de calificaciones recibidas';
COMMENT ON COLUMN asesores.orden IS 'Orden de aparición en el carrusel (menor = primero)';

-- Insertar asesores de ejemplo
INSERT INTO asesores (nombre_completo, telefono, foto_url, calificacion_promedio, total_calificaciones, orden, especialidad, horario_atencion) VALUES
('María González', '+573001234567', 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=0D8ABC&color=fff&size=200', 4.8, 156, 1, 'Electrohogar', 'Lun-Vie 8am-6pm, Sáb 9am-1pm'),
('Carlos Rodríguez', '+573007654321', 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=4CAF50&color=fff&size=200', 4.9, 203, 2, 'Motos', 'Lun-Sáb 8am-6pm'),
('Ana Martínez', '+573009876543', 'https://ui-avatars.com/api/?name=Ana+Martinez&background=FF5722&color=fff&size=200', 4.7, 98, 3, 'Muebles', 'Lun-Vie 9am-5pm'),
('Juan Pérez', '+573002345678', 'https://ui-avatars.com/api/?name=Juan+Perez&background=9C27B0&color=fff&size=200', 5.0, 45, 4, 'Herramientas', 'Lun-Vie 8am-6pm, Sáb 9am-2pm');

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_asesores_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_asesores_timestamp
    BEFORE UPDATE ON asesores
    FOR EACH ROW
    EXECUTE FUNCTION update_asesores_timestamp();
