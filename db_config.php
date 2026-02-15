<?php
/**
 * =============================================
 *  CONFIGURACIÓN DE BASE DE DATOS
 * =============================================
 *  Archivo centralizado de conexión a BD.
 *  Usa la base de datos: redsocial6daai
 *  (definida en sql/base_de_datos.sql)
 * =============================================
 */

$DB_HOST = "localhost";
$DB_USER = "root";
$DB_PASS = "";
$DB_NAME = "redsocial6daai";

/**
 * Crea y retorna una conexión MySQLi.
 * Termina con HTTP 500 si falla.
 */
function getDBConnection() {
    global $DB_HOST, $DB_USER, $DB_PASS, $DB_NAME;

    $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode([
            'success' => false,
            'error'   => 'Error de conexión a la base de datos'
        ]));
    }

    $conn->set_charset("utf8mb4");
    return $conn;
}

/**
 * Envía una respuesta JSON y finaliza el script.
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Obtiene el id del usuario actual (simulado).
 * En producción vendría de la sesión/auth.
 * Retorna el id_usuario de 'Marina Valentine' por defecto.
 */
function getCurrentUserId() {
    return 1; // id_usuario = 1 (primer usuario registrado)
}

function getCurrentUserName() {
    return 'Marina Valentine';
}
?>
