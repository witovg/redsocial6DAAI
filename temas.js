document.addEventListener("DOMContentLoaded", function () {
    cargarTemas(1);
});

function cargarTemas(categoria_id) {

    fetch("listar_temas.php?categoria_id=" + categoria_id)
        .then(response => response.json())
        .then(data => {

            const lista = document.querySelector(".forum-post-list");
            lista.innerHTML = "";

            data.forEach(tema => {

                let iconos = "";

                if (tema.estado == 0) {
                    iconos += `<span class="badge cerrado">🔒 Cerrado</span> `;
                }

                if (tema.nuevo) {
                    iconos += `<span class="badge nuevo">🟢 Nuevo</span> `;
                }

                if (tema.hot) {
                    iconos += `<span class="badge hot">🔥 Hot</span> `;
                }

                const html = `
                <div class="forum-post">
                    <div class="forum-post-meta">
                        <p class="forum-post-timestamp">${tema.fecha}</p>
                    </div>

                    <div class="forum-post-content">
                        <div class="forum-post-user">
                            <img src="${tema.avatar}" width="50">
                            <p class="forum-post-user-title">${tema.nombre}</p>
                            <p class="forum-post-user-text">@${tema.username}</p>
                        </div>

                        <div class="forum-post-info">
                            <p class="forum-post-paragraph">
                                <strong>${tema.titulo}</strong>
                            </p>

                            <p>${iconos}</p>

                            <p class="forum-post-paragraph">
                                ${tema.contenido}
                            </p>

                            <p><strong>${tema.respuestas}</strong> respuestas</p>
                        </div>
                    </div>
                </div>
                `;

                lista.innerHTML += html;
            });

        });
}
