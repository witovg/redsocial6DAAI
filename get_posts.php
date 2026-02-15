<?php
/**
 * =============================================
 *  GET POSTS — Infinite Scroll Endpoint
 * =============================================
 *  Devuelve posts paginados del newsfeed.
 *  Usa tabla: publicaciones + usuarios
 *  GET: ?page=N (default 1)
 * =============================================
 */

require_once __DIR__ . '/php/db_config.php';

$conn = getDBConnection();

$page   = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit  = 5;
$offset = ($page - 1) * $limit;

$sql = "SELECT p.id_publicacion, p.contenido, p.tipo_publicacion, p.fecha_creacion,
               u.nombre_completo, u.nombre_usuario, u.url_avatar
        FROM publicaciones p
        INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.visibilidad = 'publico'
        ORDER BY p.id_publicacion DESC 
        LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$count = 0;
while ($row = $result->fetch_assoc()) {
    $count++;
    $nombre  = htmlspecialchars($row['nombre_completo'] ?: $row['nombre_usuario'], ENT_QUOTES, 'UTF-8');
    $texto   = htmlspecialchars($row['contenido'], ENT_QUOTES, 'UTF-8');
    $fecha   = htmlspecialchars($row['fecha_creacion'], ENT_QUOTES, 'UTF-8');
    $avatar  = $row['url_avatar'] ? htmlspecialchars($row['url_avatar'], ENT_QUOTES, 'UTF-8') : 'img/avatar/01.jpg';

    // Buscar adjuntos de imagen
    $idPub = (int)$row['id_publicacion'];
    $stmtAdj = $conn->prepare(
        "SELECT url_archivo FROM adjuntos_publicacion 
         WHERE id_publicacion = ? AND tipo_archivo = 'imagen' LIMIT 1"
    );
    $stmtAdj->bind_param("i", $idPub);
    $stmtAdj->execute();
    $adjResult = $stmtAdj->get_result();
    $adjRow = $adjResult->fetch_assoc();
    $stmtAdj->close();

    $imagenHTML = '';
    if ($adjRow) {
        $imgUrl = htmlspecialchars($adjRow['url_archivo'], ENT_QUOTES, 'UTF-8');
        $imagenHTML = '
          <div class="widget-box-status-content">
            <figure class="widget-box-picture popup-picture-trigger">
              <img src="' . $imgUrl . '" alt="post-image">
            </figure>
          </div>';
    }

    echo '
    <!-- WIDGET BOX (Post dinámico) -->
    <div class="widget-box no-padding">
      <div class="widget-box-settings">
        <div class="post-settings-wrap">
          <div class="post-settings">
            <svg class="post-settings-icon icon-more-dots">
              <use xlink:href="#svg-more-dots"></use>
            </svg>
          </div>
        </div>
      </div>

      <div class="widget-box-status">
        <div class="widget-box-status-content">
          <div class="user-status">
            <div class="user-status-avatar">
              <div class="user-avatar small no-outline">
                <div class="user-avatar-content">
                  <div class="hexagon-image-30-32" data-src="' . $avatar . '"></div>
                </div>
              </div>
            </div>

            <p class="user-status-title medium">
              <a class="bold" href="#">' . $nombre . '</a>
            </p>

            <p class="user-status-text small">' . $fecha . '</p>
          </div>

          <p class="widget-box-status-text">' . $texto . '</p>
        </div>
        ' . $imagenHTML . '

        <div class="post-options">
          <div class="post-option-wrap">
            <div class="post-option">
              <svg class="post-option-icon icon-thumbs-up">
                <use xlink:href="#svg-thumbs-up"></use>
              </svg>
              <p class="post-option-text">React!</p>
            </div>
          </div>

          <div class="post-option">
            <svg class="post-option-icon icon-comment">
              <use xlink:href="#svg-comment"></use>
            </svg>
            <p class="post-option-text">Comment</p>
          </div>

          <div class="post-option">
            <svg class="post-option-icon icon-share">
              <use xlink:href="#svg-share"></use>
            </svg>
            <p class="post-option-text">Share</p>
          </div>
        </div>
      </div>
    </div>
    <!-- /WIDGET BOX -->
    ';
}

if ($count === 0) {
    http_response_code(204);
}

$stmt->close();
$conn->close();
?>
