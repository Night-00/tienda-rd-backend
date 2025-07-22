document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANTE: Reemplaza esto con tu número de WhatsApp real
    const numeroWhatsApp = '18096573871'; 
    
    // Función para dibujar los productos en una sección específica de la página
    const mostrarProductos = (productos, container) => {
        if (!container) return; // Si el contenedor no existe, no hace nada
        container.innerHTML = ''; // Limpia el contenido anterior (ej. "Cargando...")
        if (productos.length === 0) {
            container.innerHTML = '<p class="mensaje-vacio">No hay productos disponibles en esta categoría.</p>';
            return;
        }
        // Crea una tarjeta HTML por cada producto
        productos.forEach(producto => {
            const mensajeWhatsApp = encodeURIComponent(`Hola, estoy interesado en el producto: ${producto.nombre}`);
            const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeWhatsApp}`;
            const tarjeta = document.createElement('div');
            tarjeta.className = 'product-card';
            tarjeta.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="product-info">
                    <h3>${producto.nombre}</h3>
                    <p class="product-price">$${parseFloat(producto.precio).toFixed(2)}</p>
                    <a href="${enlaceWhatsApp}" class="btn-whatsapp" target="_blank">Contactar por WhatsApp</a>
                </div>
            `;
            container.appendChild(tarjeta);
        });
    };

    // Función principal que se ejecuta al cargar la página
    const cargarYDistribuirProductos = async () => {
        try {
            // Pide al servidor la lista completa de productos
            const response = await fetch('/api/productos');
            const todosLosProductos = await response.json();

            // Distribuye los productos en sus respectivas categorías
            const categorias = ['Ropa', 'Calzado', 'Interiores', 'Accesorios', 'Hogar'];
            categorias.forEach(cat => {
                const gridContainer = document.getElementById(`grid-${cat.toLowerCase()}`);
                if (gridContainer) {
                    const productosDeCategoria = todosLosProductos.filter(p => p.categoria === cat);
                    mostrarProductos(productosDeCategoria, gridContainer);
                }
            });

            // Añade la lógica a los botones de filtro de cada sección
            document.querySelectorAll('.filtros button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const botonClicado = e.target;
                    const categoria = botonClicado.dataset.categoria;
                    const subcategoria = botonClicado.dataset.subcategoria;
                    
                    const gridContainer = document.getElementById(`grid-${categoria.toLowerCase()}`);
                    const productosDeCategoria = todosLosProductos.filter(p => p.categoria === categoria);
                    const productosFiltrados = subcategoria === 'Todo'
                        ? productosDeCategoria
                        : productosDeCategoria.filter(p => p.subcategoria === subcategoria);
                    
                    mostrarProductos(productosFiltrados, gridContainer);

                    // Pone el botón activo en el grupo correcto
                    botonClicado.parentElement.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                    botonClicado.classList.add('active');
                });
            });

        } catch (error) {
            console.error('Error al cargar productos:', error);
            document.querySelectorAll('.product-grid').forEach(grid => {
                grid.innerHTML = '<p class="mensaje-vacio">Error al conectar con el servidor.</p>';
            });
        }
    };
    
    // Inicia todo el proceso
    cargarYDistribuirProductos();
});