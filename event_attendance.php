<?php
/**
 * =============================================
 *  EVENT ATTENDANCE API
 * =============================================
 *  Usa tablas: participantes_evento + eventos
 *  Estados BD: 'asistire', 'interesado', 'no_asistire'
 *
 *  GET    ?evento=titulo       → Obtener asistencia
 *  POST   {evento, estado}     → Registrar/actualizar
 *  DELETE ?evento=titulo       → Cancelar asistencia
 * =============================================
 */

require_once __DIR__ . '/php/db_config.php';

$conn   = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$userId = getCurrentUserId();

/* ── Mapeo de estados JS ↔ BD ─────────────── */
// JS usa: going, maybe, not_going
// BD usa: asistire, interesado, no_asistire
$JS_TO_DB = [
    'going'    => 'asistire',
    'maybe'    => 'interesado',
    'not_going'=> 'no_asistire'
];
$DB_TO_JS = array_flip($JS_TO_DB);

/**
 * Busca el id_evento a partir del título.
 */
function findEventByTitle($conn, $titulo) {
    $stmt = $conn->prepare("SELECT id_evento FROM eventos WHERE titulo = ? LIMIT 1");
    $stmt->bind_param("s", $titulo);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    return $row ? (int)$row['id_evento'] : null;
}

switch ($method) {

    /* ── GET: Obtener estado de asistencia ──── */
    case 'GET':
        $titulo = isset($_GET['evento']) ? trim($_GET['evento']) : '';
        if (empty($titulo)) {
            jsonResponse(['success' => false, 'error' => 'Falta el nombre del evento'], 400);
        }

        $idEvento = findEventByTitle($conn, $titulo);

        // Si el evento no existe en BD, devolver estado vacío (funciona con fallback)
        if (!$idEvento) {
            jsonResponse([
                'success'   => true,
                'evento'    => $titulo,
                'mi_estado' => 'none',
                'conteos'   => ['going' => 0, 'maybe' => 0, 'not_going' => 0],
                'total_asistentes' => 0,
                'asistentes' => []
            ]);
        }

        // Estado del usuario actual
        $stmt = $conn->prepare(
            "SELECT estado FROM participantes_evento WHERE id_evento = ? AND id_usuario = ?"
        );
        $stmt->bind_param("ii", $idEvento, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $myStatusDB = $row ? $row['estado'] : null;
        $myStatusJS = $myStatusDB ? ($DB_TO_JS[$myStatusDB] ?? 'none') : 'none';
        $stmt->close();

        // Conteos por estado
        $stmt2 = $conn->prepare(
            "SELECT estado, COUNT(*) as total 
             FROM participantes_evento 
             WHERE id_evento = ? 
             GROUP BY estado"
        );
        $stmt2->bind_param("i", $idEvento);
        $stmt2->execute();
        $result2 = $stmt2->get_result();

        $counts = ['going' => 0, 'maybe' => 0, 'not_going' => 0];
        while ($r = $result2->fetch_assoc()) {
            $jsKey = $DB_TO_JS[$r['estado']] ?? null;
            if ($jsKey) {
                $counts[$jsKey] = (int)$r['total'];
            }
        }
        $stmt2->close();

        // Lista de asistentes
        $stmt3 = $conn->prepare(
            "SELECT u.nombre_completo, pe.estado
             FROM participantes_evento pe
             INNER JOIN usuarios u ON pe.id_usuario = u.id_usuario
             WHERE pe.id_evento = ? AND pe.estado IN ('asistire', 'interesado')
             ORDER BY pe.id ASC 
             LIMIT 20"
        );
        $stmt3->bind_param("i", $idEvento);
        $stmt3->execute();
        $result3 = $stmt3->get_result();

        $attendees = [];
        while ($r = $result3->fetch_assoc()) {
            $attendees[] = [
                'usuario' => $r['nombre_completo'],
                'estado'  => $DB_TO_JS[$r['estado']] ?? $r['estado']
            ];
        }
        $stmt3->close();

        jsonResponse([
            'success'   => true,
            'evento'    => $titulo,
            'mi_estado' => $myStatusJS,
            'conteos'   => $counts,
            'total_asistentes' => $counts['going'] + $counts['maybe'],
            'asistentes' => $attendees
        ]);
        break;

    /* ── POST: Registrar/actualizar asistencia */
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        $titulo = isset($input['evento']) ? trim($input['evento']) : '';
        $estadoJS = isset($input['estado']) ? trim($input['estado']) : '';

        if (empty($titulo)) {
            jsonResponse(['success' => false, 'error' => 'Falta el nombre del evento'], 400);
        }

        if (!isset($JS_TO_DB[$estadoJS])) {
            jsonResponse([
                'success' => false, 
                'error'   => 'Estado inválido. Usar: going, maybe, not_going'
            ], 400);
        }

        $estadoDB = $JS_TO_DB[$estadoJS];

        $idEvento = findEventByTitle($conn, $titulo);
        if (!$idEvento) {
            // Si no existe el evento en BD, responder con éxito para que el 
            // frontend funcione con localStorage como fallback
            jsonResponse([
                'success'          => true,
                'evento'           => $titulo,
                'mi_estado'        => $estadoJS,
                'total_asistentes' => 0,
                'nota'             => 'Evento no encontrado en BD, guardado localmente'
            ]);
        }

        // Verificar si ya existe participación
        $stmt = $conn->prepare(
            "SELECT id FROM participantes_evento WHERE id_evento = ? AND id_usuario = ?"
        );
        $stmt->bind_param("ii", $idEvento, $userId);
        $stmt->execute();
        $exists = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($exists) {
            // UPDATE
            $stmt = $conn->prepare(
                "UPDATE participantes_evento SET estado = ? WHERE id_evento = ? AND id_usuario = ?"
            );
            $stmt->bind_param("sii", $estadoDB, $idEvento, $userId);
        } else {
            // INSERT
            $stmt = $conn->prepare(
                "INSERT INTO participantes_evento (id_evento, id_usuario, estado) VALUES (?, ?, ?)"
            );
            $stmt->bind_param("iis", $idEvento, $userId, $estadoDB);
        }

        if ($stmt->execute()) {
            $stmt->close();

            // Conteo actualizado
            $stmt2 = $conn->prepare(
                "SELECT COUNT(*) as total 
                 FROM participantes_evento 
                 WHERE id_evento = ? AND estado IN ('asistire', 'interesado')"
            );
            $stmt2->bind_param("i", $idEvento);
            $stmt2->execute();
            $r = $stmt2->get_result()->fetch_assoc();
            $totalAsistentes = (int)$r['total'];
            $stmt2->close();

            jsonResponse([
                'success'          => true,
                'evento'           => $titulo,
                'mi_estado'        => $estadoJS,
                'total_asistentes' => $totalAsistentes
            ]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Error al guardar'], 500);
        }
        break;

    /* ── DELETE: Cancelar asistencia ─────────── */
    case 'DELETE':
        $titulo = isset($_GET['evento']) ? trim($_GET['evento']) : '';
        if (empty($titulo)) {
            jsonResponse(['success' => false, 'error' => 'Falta el nombre del evento'], 400);
        }

        $idEvento = findEventByTitle($conn, $titulo);
        if (!$idEvento) {
            jsonResponse([
                'success'          => true,
                'evento'           => $titulo,
                'mi_estado'        => 'none',
                'total_asistentes' => 0,
                'eliminado'        => false
            ]);
        }

        $stmt = $conn->prepare(
            "DELETE FROM participantes_evento WHERE id_evento = ? AND id_usuario = ?"
        );
        $stmt->bind_param("ii", $idEvento, $userId);
        $stmt->execute();
        $deleted = $stmt->affected_rows;
        $stmt->close();

        // Conteo actualizado
        $stmt2 = $conn->prepare(
            "SELECT COUNT(*) as total 
             FROM participantes_evento 
             WHERE id_evento = ? AND estado IN ('asistire', 'interesado')"
        );
        $stmt2->bind_param("i", $idEvento);
        $stmt2->execute();
        $r = $stmt2->get_result()->fetch_assoc();
        $totalAsistentes = (int)$r['total'];
        $stmt2->close();

        jsonResponse([
            'success'          => true,
            'evento'           => $titulo,
            'mi_estado'        => 'none',
            'total_asistentes' => $totalAsistentes,
            'eliminado'        => $deleted > 0
        ]);
        break;

    default:
        jsonResponse(['success' => false, 'error' => 'Método no permitido'], 405);
}

$conn->close();
?>
