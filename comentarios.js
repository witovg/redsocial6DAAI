document.addEventListener("DOMContentLoaded", function () {

    const idPublicacion = 1; // CAMBIA dinámicamente si quieres
    const idUsuario = 1;     // Usuario logueado

    const contenedor = document.getElementById("comments");

    /* ========================
       CARGAR COMENTARIOS
    ======================== */
    function cargarComentarios() {

        fetch(`comentarios.php?action=listar&id_publicacion=${idPublicacion}`)
        .then(res => res.json())
        .then(data => {

            contenedor.innerHTML = "";

            data.forEach(c => {

                contenedor.innerHTML += `
                <div class="post-comment">
                
                    <img src="${c.url_avatar ?? 'img/avatar/01.jpg'}" width="30">
                    <p class="post-comment-text">
                        <strong>${c.nombre_usuario}</strong> ${c.contenido}
                    </p>
                    <span style="font-size:12px;color:gray">
                        ${c.fecha_creacion}
                    </span>
                </div>
                `;
            });

        });
    }

    cargarComentarios();


    /* ========================
       AGREGAR COMENTARIO
    ======================== */
    const form = document.getElementById("formComentario");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const contenido = document.getElementById("contenidoComentario").value;

            fetch("comentarios.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `action=agregar&id_publicacion=${idPublicacion}&id_usuario=${idUsuario}&contenido=${encodeURIComponent(contenido)}`
            })
            .then(res => res.text())
            .then(() => {
                document.getElementById("contenidoComentario").value = "";
                cargarComentarios();
            });
        });
    }


    /* ========================
       SHARE
    ======================== */
    const shareBtn = document.querySelector(".icon-share");

    if (shareBtn) {
        shareBtn.addEventListener("click", function () {

            fetch("comentarios.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `action=share&id_publicacion=${idPublicacion}`
            })
            .then(res => res.text())
            .then(() => {
                alert("Publicación compartida 🔥");
            });

        });
    }

});
