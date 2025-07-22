document.addEventListener('DOMContentLoaded', async () => {
    // 1. VERIFICACIÓN DE SEGURIDAD
    // Pregunta al servidor si el usuario tiene una sesión activa antes de hacer nada.
    try {
        const sessionResponse = await fetch('/api/check_session');
        const sessionData = await sessionResponse.json();
        if (!sessionData.logged_in) {
            window.location.href = '/login'; // Si no hay sesión, te expulsa al login
            return;
        }
    } catch (error) {
        console.error("Error de conexión, redirigiendo al login", error);
        window.location.href = '/login';
        return;
    }

    // 2. REFERENCIAS A ELEMENTOS DEL HTML
    const form = document.getElementById('form-agregar-producto');
    const listaAdmin = document.getElementById('lista-productos-admin');
    const btnLogout = document.getElementById('btn-logout');

    // Función para convertir un archivo de imagen a texto (Data URL) para guardarlo en la BD
    const leerArchivo = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });

    // Función para cargar y mostrar la lista de productos en el panel
    const cargarProductosAdmin = async () => {
        const res = await fetch('/api/productos');
        const productos = await res.json();
        listaAdmin.innerHTML = '';
        productos.forEach(p => {
            const item = document.createElement('div');
            item.className = 'admin-product-item';
            item.innerHTML = `<span>${p.nombre}</span><button class="btn-delete" data-id="${p.id}">Eliminar</button>`;
            listaAdmin.appendChild(item);
        });
    };

    // 3. LÓGICA DE EVENTOS
    
    // Cuando envías el formulario para AÑADIR un producto
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('imagen').files[0];
        if (!file) return alert('Por favor, selecciona una imagen para el producto.');
        
        const imagenDataUrl = await leerArchivo(file);

        const producto = {
            nombre: document.getElementById('nombre').value,
            precio: parseFloat(document.getElementById('precio').value),
            categoria: document.getElementById('categoria').value,
            subcategoria: document.getElementById('subcategoria').value,
            imagen: imagenDataUrl
        };

        await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });
        
        form.reset();
        document.getElementById('file-name').textContent = 'Ningún archivo seleccionado';
        cargarProductosAdmin(); // Recarga la lista para mostrar el nuevo producto
    });

    // Cuando haces clic en un botón de "Eliminar"
    listaAdmin.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;
            if (confirm("¿Estás seguro de que quieres borrar este producto permanentemente?")) {
                await fetch(`/api/productos/${id}`, { method: 'DELETE' });
                cargarProductosAdmin(); // Recarga la lista para que el producto desaparezca
            }
        }
    });
    
    // Cuando haces clic en "Cerrar Sesión"
    btnLogout.addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login'; // Redirige a la página de login
    });

    // Carga inicial de productos al entrar al panel
    cargarProductosAdmin();
});