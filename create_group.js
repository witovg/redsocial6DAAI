document.addEventListener('DOMContentLoaded', function() {
    const createGroupForm = document.getElementById('form-create-group');

    // Escuchamos el envío del formulario
    createGroupForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Evitamos que la página se recargue

        const formData = new FormData(createGroupForm);

        fetch('crear_grupo.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("¡Grupo creado con éxito!");
                // Redirigimos a la página del grupo (suponiendo que tienes un group.php)
                window.location.href = `group.php?id=${data.id}`;
            } else {
                alert("Error al crear el grupo: " + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error de conexión al servidor.");
        });
    });
});

// Función para abrir el modal (puedes llamarla desde tu botón de "Crear Grupo" en el header)
function openCreateGroupModal() {
    document.getElementById('modal-create-group').style.display = 'block';
}