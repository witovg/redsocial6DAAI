<?php
include "conexion.php";

$action = $_POST['action'] ?? $_GET['action'] ?? '';

/* =========================
   AGREGAR COMENTARIO
========================= */
if ($action == "agregar") {

    $id_publicacion = intval($_POST['id_publicacion']);
    $id_usuario = intval($_POST['id_usuario']);
    $contenido = $conn->real_escape_string($_POST['contenido']);

    $sql = "INSERT INTO comentarios (id_publicacion, id_usuario, contenido)
            VALUES ($id_publicacion, $id_usuario, '$contenido')";

    if ($conn->query($sql)) {

        // Actualizar contador
        $conn->query("
            UPDATE publicaciones 
            SET contador_comentarios = contador_comentarios + 1 
            WHERE id_publicacion = $id_publicacion
        ");

        echo "ok";
    }
}

/* =========================
   LISTAR COMENTARIOS
========================= */
if ($action == "listar") {

    $id_publicacion = intval($_GET['id_publicacion']);

    $sql = "SELECT c.*, u.nombre_usuario, u.url_avatar
            FROM comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            WHERE c.id_publicacion = $id_publicacion
            ORDER BY c.fecha_creacion DESC";

    $result = $conn->query($sql);

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
}

/* =========================
   SHARE
========================= */
if ($action == "share") {

    $id_publicacion = intval($_POST['id_publicacion']);

    $conn->query("
        UPDATE publicaciones 
        SET contador_compartidos = contador_compartidos + 1 
        WHERE id_publicacion = $id_publicacion
    ");

    echo "shared";
}
?>
