//Para que las medallas queden grabadas en la tabla insignias_usuario cuando se alcanzan, puedes ejecutar este proceso al final de get_badges.php o mediante una tarea programada.


// Ejemplo de lógica para insertar si se cumple la meta
foreach ($medallas as $m) {
    if ($m['actual'] >= $m['meta']) {
        // Verificar si ya la tiene para no duplicar
        $check = $conn->prepare("SELECT id FROM insignias_usuario WHERE id_usuario = ? AND id_insignia = (SELECT id_insignia FROM insignias WHERE nombre LIKE ? LIMIT 1)");
        // ... lógica de inserción INSERT INTO insignias_usuario ...
    }
}