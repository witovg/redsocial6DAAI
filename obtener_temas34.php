<?php
header('Content-Type: application/json');
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tu_base_de_datos"; // Cambia por el nombre real de tu BD

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Conexión fallida"]));
}

$id_categoria = isset($_GET['id_categoria']) ? int_val($_GET['id_categoria']) : 1;

// Consulta que trae temas y cuenta respuestas
$sql = "SELECT t.*, u.nombre_usuario, u.url_avatar, 
        (SELECT COUNT(*) FROM respuestas_foro r WHERE r.id_tema = t.id_tema) as total_respuestas
        FROM temas_foro t
        JOIN usuarios u ON t.id_creador = u.id_usuario
        WHERE t.id_categoria = $id_categoria
        ORDER BY t.es_fijo DESC, t.fecha_creacion DESC";

$result = $conn->query($sql);
$temas = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $temas[] = $row;
    }
}

echo json_encode($temas);
$conn->close();
?>