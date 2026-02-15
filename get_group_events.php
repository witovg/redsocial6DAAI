<?php
header('Content-Type: application/json');
// Configuración de conexión (ajusta con tus credenciales)
$host = 'localhost';
$db   = 'database_db';  //CAMBIAR NOMBRE DE LA BASE DE DATOS.
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    
    $group_id = $_GET['group_id'] ?? 0;

    // Consulta para obtener eventos específicos del grupo
    $stmt = $pdo->prepare("SELECT id, title, event_date, event_time, location, cover_image, description 
                           FROM group_events 
                           WHERE group_id = ? 
                           ORDER BY event_date ASC");
    $stmt->execute([$group_id]);
    $events = $stmt->fetchAll(PDO::ATTR_ASSOC);

    echo json_encode($events);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>