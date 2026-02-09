document.getElementById("formCambiarPassword").addEventListener("submit", function (e) {
    e.preventDefault();

    const datos = new FormData(this);

    fetch("cambiar_password.php", {
        method: "POST",
        body: datos
    })
    .then(res => res.json())
    .then(data => {
        const mensaje = document.getElementById("mensaje");
        mensaje.textContent = data.msg; 
        alert(data.msg);
        mensaje.style.color = data.status === "ok" ? "green" : "red";
    });
});
