document.getElementById('formEditarPerfil').addEventListener('submit', function (e) {
  e.preventDefault();

  const datos = new FormData(this);

  fetch('editar-perfil.php', {
    method: 'POST',
    body: datos
  })
  .then(res => res.json())
  .then(respuesta => {
    alert(respuesta.mensaje);
  })
  .catch(error => {
    console.error('Error:', error);
  });
});
