document.addEventListener('DOMContentLoaded', function() {
    fetch('get_badges.php')
        .then(response => response.json())
        .then(data => {
            data.forEach(medalla => {
                const bar = document.getElementById(medalla.id);
                if (bar) {
                    // Calcular porcentaje
                    let porcentaje = (medalla.actual / medalla.meta) * 100;
                    if (porcentaje > 100) porcentaje = 100;

                    // Actualizar Barra de Progreso (Ancho)
                    bar.style.width = porcentaje + '%';

                    // Buscar el contenedor de texto cercano
                    const textContainer = bar.parentElement.parentElement.querySelector('.bar-progress-text');
                    if (textContainer) {
                        textContainer.innerText = `${medalla.actual}/${medalla.meta}`;
                    }

                    // Estilo visual si está completada
                    if (porcentaje === 100) {
                        bar.classList.add('completed'); 
                        // Podrías añadir una clase al contenedor padre para quitar el grayscale
                        bar.closest('.badge-item-stat').classList.remove('locked');
                    }
                }
            });
        })
        .catch(error => console.error('Error cargando medallas:', error));
});