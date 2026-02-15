<?php
header('Content-Type: application/json');
session_start();

// Simulación de usuario logueado (En un sistema real usarías $_SESSION['id_usuario'])
$id_creador = 1; // ID del usuario_prueba que insertamos al principio

$conn = new mysqli("localhost", "root", "", "data_db"); //CAMBIAR NOMBRE DE LA BASE DE DATOS.
$conn->set_charset("utf8");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $conn->real_escape_string($_POST['nombre']);
    $desc = $conn->real_escape_string($_POST['descripcion']);
    $cat = $conn->real_escape_string($_POST['categoria']);

    // 1. Insertar el grupo
    $sql = "INSERT INTO grupos_comunidad (id_creador, nombre, descripcion, categoria) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isss", $id_creador, $nombre, $desc, $cat);

    if ($stmt->execute()) {
        $id_nuevo_grupo = $conn->insert_id;

        // 2. Insertar al creador como Miembro Administrador
        $sql_miembro = "INSERT INTO miembros_grupo (id_grupo, id_usuario, rol, estado) VALUES (?, ?, 'admin', 'activo')";
        $stmt_m = $conn->prepare($sql_miembro);
        $stmt_m->bind_param("ii", $id_nuevo_grupo, $id_creador);
        $stmt_m->execute();

        echo json_encode(["success" => true, "id" => $id_nuevo_grupo]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
}
$conn->close();