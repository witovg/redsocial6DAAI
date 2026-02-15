<?php
require "config.php";

$id_tema = isset($_POST["id_tema"]) ? intval($_POST["id_tema"]) : 0;
$id_usuario = isset($_POST["id_usuario"]) ? intval($_POST["id_usuario"]) : 0;
$contenido = isset($_POST["contenido"]) ? trim($_POST["contenido"]) : "";
$id_respuesta_padre = isset($_POST["id_respuesta_padre"]) && $_POST["id_respuesta_padre"] !== ""
    ? intval($_POST["id_respuesta_padre"])
    : null;

if ($id_tema <= 0 || $id_usuario <= 0 || $contenido === "") {
    echo json_encode(["ok" => false, "error" => "Datos incompletos"]);
    exit;
}

$sql = "INSERT INTO respuestas_foro (id_tema, id_usuario, id_respuesta_padre, contenido)
        VALUES (?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiis", $id_tema, $id_usuario, $id_respuesta_padre, $contenido);

if ($stmt->execute()) {
    echo json_encode(["ok" => true, "id_respuesta" => $stmt->insert_id]);
} else {
    echo json_encode(["ok" => false, "error" => $conn->error]);
}

$stmt->close();
