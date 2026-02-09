<?php
header('Content-Type: application/json');

// Conexión a la base de datos
$conexion = new mysqli("localhost", "root", "", "redsocial6daai");

if ($conexion->connect_error) {
  echo json_encode(["mensaje" => "Error de conexión a la base de datos"]);
  exit;
}

// ⚠️ En producción este ID debe venir de la sesión
$id_usuario = 1;

// Campos reales que existen en la tabla usuarios
$profesion = $_POST['profile_job_1_title'] ?? '';
$biografia = $_POST['profile_job_1_description'] ?? '';

$sql = "UPDATE usuarios 
        SET profesion = ?, biografia = ?
        WHERE id_usuario = ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("ssi", $profesion, $biografia, $id_usuario);

if ($stmt->execute()) {
  echo json_encode(["mensaje" => "Perfil actualizado correctamente"]);
} else {
  echo json_encode(["mensaje" => "Error al actualizar el perfil"]);
}

$stmt->close();
$conexion->close();
