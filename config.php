<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "TU_BASE_DE_DATOS"; // <-- cambia por el nombre real

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>
