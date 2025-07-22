# ====================================================================
#      SERVIDOR BACKEND PARA LA APLICACIÓN DE TIENDA (app.py)
# ====================================================================

# --- 1. Importaciones necesarias ---
import sqlite3
import os
from flask import Flask, jsonify, render_template, request, session, redirect, url_for

# --- 2. Configuración de la Aplicación Flask ---
app = Flask(__name__)

# Clave secreta para encriptar las sesiones de usuario.
# Es fundamental para la seguridad del login.
# os.urandom(24) genera una clave aleatoria cada vez que se inicia.
app.secret_key = os.urandom(24) 

# --- 3. Configuración de la Base de Datos ---

# Ruta donde se guardará el archivo de la base de datos.
# os.environ.get('RENDER') es una variable que Render.com define.
# Si la app corre en Render, usará el disco persistente '/var/data/database.db'.
# Si corre en tu PC, usará un archivo local 'database.db'.
IS_ON_RENDER = os.environ.get('RENDER')
if IS_ON_RENDER:
    # Ruta en el disco persistente de Render
    DB_PATH = os.path.join('/var/data', 'database.db')
else:
    # Ruta local para desarrollo
    DB_PATH = 'database.db'

def get_db_connection():
    """Crea y devuelve una conexión a la base de datos."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row # Permite acceder a los datos por nombre de columna.
    return conn

# --- 4. Credenciales del Administrador ---
# En una aplicación real, esto estaría encriptado en una base de datos de usuarios.
ADMIN_USER = 'admin'
ADMIN_PASS = '1234'

# --- 5. Rutas para servir las Páginas HTML (Vistas) ---

@app.route('/')
def index_page():
    """Muestra la página principal de la tienda."""
    return render_template('index.html')

@app.route('/login')
def login_page():
    """Muestra la página de inicio de sesión."""
    return render_template('login.html')

@app.route('/admin')
def admin_page():
    """Muestra el panel de administración, pero solo si el usuario ha iniciado sesión."""
    if 'logged_in' not in session:
        return redirect(url_for('login_page'))
    return render_template('Admin.html')


# --- 6. Rutas de la API (para que JavaScript se comunique con el servidor) ---

# API para la gestión de la sesión
@app.route('/api/login', methods=['POST'])
def login():
    """Valida las credenciales y crea una sesión."""
    data = request.get_json()
    if data.get('username') == ADMIN_USER and data.get('password') == ADMIN_PASS:
        session['logged_in'] = True
        return jsonify({'status': 'success'})
    return jsonify({'status': 'error', 'message': 'Credenciales incorrectas'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Cierra la sesión del usuario."""
    session.clear()
    return jsonify({'status': 'success'})

@app.route('/api/check_session', methods=['GET'])
def check_session():
    """Verifica si hay una sesión activa."""
    return jsonify({'logged_in': 'logged_in' in session})


# API para la gestión de productos
@app.route('/api/productos', methods=['GET'])
def get_productos():
    """Devuelve la lista completa de productos. Es una ruta pública."""
    conn = get_db_connection()
    productos = conn.execute('SELECT * FROM productos ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(row) for row in productos])

@app.route('/api/productos', methods=['POST'])
def add_producto():
    """Añade un nuevo producto. Ruta protegida."""
    if 'logged_in' not in session:
        return jsonify({'status': 'error', 'message': 'No autorizado'}), 403
    
    data = request.get_json()
    conn = get_db_connection()
    conn.execute('INSERT INTO productos (nombre, precio, categoria, subcategoria, imagen) VALUES (?, ?, ?, ?, ?)',
                 (data['nombre'], data['precio'], data['categoria'], data.get('subcategoria'), data['imagen']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success', 'message': 'Producto añadido'})

@app.route('/api/productos/<int:id>', methods=['DELETE'])
def delete_producto(id):
    """Borra un producto por su ID. Ruta protegida."""
    if 'logged_in' not in session:
        return jsonify({'status': 'error', 'message': 'No autorizado'}), 403
        
    conn = get_db_connection()
    conn.execute('DELETE FROM productos WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success', 'message': 'Producto borrado'})


# --- 7. Comandos de Terminal para Flask ---

@app.cli.command('init-db')
def init_db_command():
    """Crea (o reinicia) la base de datos a partir del archivo schema.sql."""
    connection = sqlite3.connect(DB_PATH)
    with open('schema.sql') as f:
        connection.executescript(f.read())
    connection.commit()
    connection.close()
    print("Base de datos inicializada en la ruta:", DB_PATH)


# --- 8. Punto de Entrada para Ejecutar la Aplicación ---
if __name__ == '__main__':
    app.run(debug=True)