document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.table-forum-discussion .table-body');
    const idCategoria = 1; // Dinámico según la página

    fetch(`obtener_temas.php?id_categoria=${idCategoria}`)
        .then(response => response.json())
        .then(data => {
            container.innerHTML = ''; // Limpiar estático
            data.forEach(tema => {
                const esNuevo = (new Date() - new Date(tema.fecha_creacion)) < 86400000;
                const esHot = tema.total_respuestas > 15;
                
                let iconos = '';
                if (tema.esta_cerrado) iconos += '<span class="icon-status closed" title="Cerrado">🔒</span>';
                if (esNuevo) iconos += '<span class="icon-status new" title="Nuevo">✨</span>';
                if (esHot) iconos += '<span class="icon-status hot" title="Popular">🔥</span>';

                container.innerHTML += `
                    <div class="table-row medium">
                        <div class="table-column">
                            <div class="discussion-preview">
                                <a class="discussion-preview-title" href="forums-discussion.html?id=${tema.id_tema}">
                                    ${iconos} ${tema.titulo}
                                </a>
                                <div class="discussion-preview-meta">
                                    <p class="discussion-preview-meta-text">Iniciado por</p>
                                    <a class="user-avatar micro no-border" href="profile-timeline.html">
                                        <div class="user-avatar-content">
                                            <div class="hexagon-image-18-20" data-src="${tema.url_avatar || 'img/avatar/default.jpg'}"></div>
                                        </div>
                                    </a>
                                    <p class="discussion-preview-meta-text"><a href="#">${tema.nombre_usuario}</a></p>
                                </div>
                            </div>
                        </div>
                        <div class="table-column centered padded-medium"><p class="table-title">${tema.contador_vistas}</p></div>
                        <div class="table-column centered padded-medium"><p class="table-title">${tema.total_respuestas}</p></div>
                        <div class="table-column padded-big-left">
                            <p class="table-title small">${tema.fecha_creacion}</p>
                        </div>
                    </div>`;
            });
            // Re-inicializar hexágonos de Vikinger si es necesario
            if(window.XM_Plugins) { /* Llamar init de hexágonos */ }
        });
});