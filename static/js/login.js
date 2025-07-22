document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('login-form');
    if (!formLogin) return; // Si no encuentra el formulario, no hace nada.

    formLogin.addEventListener('submit', async (e) => {
        // Previene que la página se recargue al enviar el formulario
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('login-error');
        errorMsg.style.display = 'none'; // Oculta errores previos

        // Envía las credenciales al servidor para ser validadas
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Procesa la respuesta del servidor
        if (response.ok) {
            // Si el servidor responde con éxito (código 200), es que el login es correcto
            window.location.href = '/admin'; // Redirige al panel de administración
        } else {
            // Si hay un error (ej. código 401 - No Autorizado), muestra el mensaje
            const result = await response.json();
            errorMsg.textContent = result.message || 'Error de autenticación.';
            errorMsg.style.display = 'block';
        }
    });
});