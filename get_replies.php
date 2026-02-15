<?php
require "config.php";

$id_tema = isset($_GET["id_tema"]) ? intval($_GET["id_tema"]) : 0;

if ($id_tema <= 0) {
    echo json_encode(["ok" => false, "error" => "id_tema inválido"]);
    exit;
}

$sql = "
SELECT 
    r.id_respuesta,
    r.id_tema,
    r.id_usuario,
    r.id_respuesta_padre,
    r.contenido,
    r.fecha_creacion,
    u.nombre_completo,
    u.nombre_usuario,
    u.url_avatar,
    u.rol
FROM respuestas_foro r
INNER JOIN usuarios u ON u.id_usuario = r.id_usuario
WHERE r.id_tema = ?
ORDER BY r.fecha_creacion ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_tema);
$stmt->execute();
$result = $stmt->get_result();

$rows = [];
while ($row = $result->fetch_assoc()) {
    $row["children"] = [];
    $rows[] = $row;
}

$stmt->close();

$map = [];
foreach ($rows as $i => $r) {
    $map[$r["id_respuesta"]] = $i;
}

$tree = [];
foreach ($rows as $i => $r) {
    if ($r["id_respuesta_padre"] === null) {
        $tree[] = &$rows[$i];
    } else {
        $parentId = $r["id_respuesta_padre"];
        if (isset($map[$parentId])) {
            $rows[$map[$parentId]]["children"][] = &$rows[$i];
        } else {
            $tree[] = &$rows[$i]; 
        }
    }
}

echo json_encode(["ok" => true, "data" => $tree], JSON_UNESCAPED_UNICODE);
