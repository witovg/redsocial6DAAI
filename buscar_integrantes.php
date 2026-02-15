<?php
header('Content-Type: application/json');


$servername = "localhost";
$username = "root";
$password = "";
$dbname = "basededatos_db"; 

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    die(json_encode(["error" => "Error de conexión"]));
}

$query = isset($_GET['query']) ? $conn->real_escape_string($_GET['query']) : '';
$id_grupo = isset($_GET['id_grupo']) ? intval($_GET['id_grupo']) : 0;

if ($id_grupo > 0) {

    $sql = "SELECT u.id_usuario, u.nombre_usuario, u.nombre_completo, u.url_avatar, mg.rol 
            FROM usuarios u
            INNER JOIN miembros_grupo mg ON u.id_usuario = mg.id_usuario
            WHERE mg.id_grupo = ? 
            AND (u.nombre_usuario LIKE ? OR u.nombre_completo LIKE ?)
            AND mg.estado = 'activo'
            LIMIT 10";

    $stmt = $conn->prepare($sql);
    $searchTerm = "%$query%";
    $stmt->bind_param("iss", $id_grupo, $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    $integrantes = [];
    while ($row = $result->fetch_assoc()) {
        $integrantes[] = $row;
    }

    echo json_encode($integrantes);
} else {
    echo json_encode(["error" => "ID de grupo no válido"]);
}

$conn->close();