-- Borra la tabla si ya existe para asegurar un inicio limpio.
DROP TABLE IF EXISTS productos;

-- Crea la tabla 'productos' con sus columnas.
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    categoria TEXT NOT NULL,
    subcategoria TEXT,
    imagen TEXT NOT NULL
);