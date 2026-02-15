<?php
/**
 * =============================================
 *  CREATE POST API
 * =============================================
 *  Endpoint para crear nuevos posts desde el
 *  widget "What's on your mind?".
 *  Usa tabla: publicaciones
 *
 *  POST {texto}  → Crear un nuevo post
 *  GET           → Obtener los últimos N posts
 * =============================================
 */

require_once __DIR__ . '/php/db_config.php';

$conn     = getDBConnection();
$method   = $_SERVER['REQUEST_METHOD'];
$userId   = getCurrentUserId();
$userName = getCurrentUserName();

switch ($method) {

    /* ── POST: Crear nuevo post ─────────────── */
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        $texto = isset($input['texto']) ? trim($input['texto']) : '';
        if (empty($texto)) {
            jsonResponse(['success' => false, 'error' => 'El texto del post no puede estar vacío'], 400);
        }

        if (mb_strlen($texto) > 5000) {
            jsonResponse(['success' => false, 'error' => 'El post es demasiado largo (máximo 5000 caracteres)'], 400);
        }

        $stmt = $conn->prepare(
            "INSERT INTO publicaciones (id_usuario, contenido, tipo_publicacion, visibilidad) 
             VALUES (?, ?, 'estandar', 'publico')"
        );
        $stmt->bind_param("is", $userId, $texto);

        if ($stmt->execute()) {
            $postId = $stmt->insert_id;
            $stmt->close();

            // Obtener el post recién creado
            $stmt2 = $conn->prepare(
                "SELECT p.id_publicacion, p.contenido, p.fecha_creacion, u.nombre_completo
                 FROM publicaciones p
                 INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
                 WHERE p.id_publicacion = ?"
            );
            $stmt2->bind_param("i", $postId);
            $stmt2->execute();
            $post = $stmt2->get_result()->fetch_assoc();
            $stmt2->close();

            jsonResponse([
                'success' => true,
                'post'    => [
                    'id'      => $post['id_publicacion'],
                    'usuario' => $post['nombre_completo'],
                    'texto'   => $post['contenido'],
                    'fecha'   => $post['fecha_creacion']
                ]
            ], 201);
        } else {
            jsonResponse(['success' => false, 'error' => 'Error al crear el post'], 500);
        }
        break;

    /* ── GET: Obtener últimos posts ─────────── */
    case 'GET':
        $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 10;

        $stmt = $conn->prepare(
            "SELECT p.id_publicacion, p.contenido, p.fecha_creacion, 
                    u.nombre_completo, u.nombre_usuario
             FROM publicaciones p
             INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
             WHERE p.visibilidad = 'publico'
             ORDER BY p.id_publicacion DESC 
             LIMIT ?"
        );
        $stmt->bind_param("i", $limit);
        $stmt->execute();
        $result = $stmt->get_result();

        $posts = [];
        while ($row = $result->fetch_assoc()) {
            $posts[] = [
                'id'      => (int)$row['id_publicacion'],
                'usuario' => $row['nombre_completo'] ?: $row['nombre_usuario'],
                'texto'   => $row['contenido'],
                'fecha'   => $row['fecha_creacion']
            ];
        }
        $stmt->close();

        jsonResponse([
            'success' => true,
            'posts'   => $posts,
            'total'   => count($posts)
        ]);
        break;

    default:
        jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$conn->close();
?>
