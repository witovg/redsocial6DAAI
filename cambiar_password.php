<?php
$conexion = new mysqli("localhost", "root", "", "redsocial6daai");

if ($conexion->connect_error) {
    die("Error de conexión");
}

$id_usuario = $_POST['id_usuario'];
$password_actual = $_POST['password_actual'];
$password_nueva = $_POST['password_nueva'];
$password_confirmar = $_POST['password_confirmar'];

if ($password_nueva !== $password_confirmar) {
    echo json_encode(["status" => "error", "msg" => "Las contraseñas no coinciden"]);
    exit;
}

$sql = "SELECT hash_contrasena FROM usuarios WHERE id_usuario = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$resultado = $stmt->get_result();
$usuario = $resultado->fetch_assoc();

if (!$usuario || !password_verify($password_actual, $usuario['hash_contrasena'])) {
    echo json_encode(["status" => "error", "msg" => "Contraseña actual incorrecta"]);
    exit;
}

$nuevo_hash = password_hash($password_nueva, PASSWORD_DEFAULT);

$update = "UPDATE usuarios SET hash_contrasena = ? WHERE id_usuario = ?";
$stmt = $conexion->prepare($update);
$stmt->bind_param("si", $nuevo_hash, $id_usuario);
$stmt->execute();

echo json_encode(["status" => "ok", "msg" => "Contraseña actualizada correctamente"]);
