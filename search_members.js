
document.addEventListener('DOMContentLoaded', function() {

    const searchInput = document.getElementById('search-members');
    const resultsContainer = document.getElementById('results-members');
    

    const urlParams = new URLSearchParams(window.location.search);
    const idGrupo = urlParams.get('id');

   
    if (!idGrupo) {
        console.warn("Buscador: No se detectó un ID de grupo en la URL.");
        return;
    }


    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();


        if (query.length < 2) {
            resultsContainer.innerHTML = ''; 
            return;
        }

        fetch(`buscar_integrantes.php?query=${encodeURIComponent(query)}&id_grupo=${idGrupo}`)
            .then(response => {

                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                return response.json(); 
            })
            .then(data => {
 
                resultsContainer.innerHTML = '';

                if (data.length === 0) {
                    resultsContainer.innerHTML = '<p class="small">No se encontraron miembros en este grupo.</p>';
                    return;
                }


                data.forEach(user => {
                    const userHTML = `
                        <div class="user-status">
                            <a class="user-status-avatar small" href="profile-timeline.html?id=${user.id_usuario}">
                                <img src="${user.url_avatar || 'img/avatar/default.jpg'}" alt="avatar" style="border-radius: 50%; width: 32px;">
                            </a>
                            <p class="user-status-title">
                                <a class="bold" href="profile-timeline.html?id=${user.id_usuario}">${user.nombre_completo}</a>
                            </p>
                            <p class="user-status-text small">@${user.nombre_usuario} - <span class="highlighted">${user.rol.toUpperCase()}</span></p>
                        </div>
                    `;
    
                    resultsContainer.insertAdjacentHTML('beforeend', userHTML);
                });
            })
            .catch(err => {
 
                console.error("Error en búsqueda AJAX:", err);
                resultsContainer.innerHTML = '<p class="small" style="color: red;">Error al conectar con el buscador.</p>';
            });
    });
});