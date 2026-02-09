<?php
header('Content-Type: application/json');

// Database configuration
$host = '127.0.0.1';
$user = 'root';
$password = '';
$dbname = 'redsocial6daai';

// Disable default exception handling for mysqli to avoid fatal errors on connection failure
mysqli_report(MYSQLI_REPORT_OFF);

// Create connection with error suppression
$conn = @new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la Base de Datos: ' . $conn->connect_error]);
    exit();
}

$action = $_POST['action'] ?? '';

if ($action === 'register') {
    $username = $_POST['register_username'] ?? '';
    $email = $_POST['register_email'] ?? '';
    $password = $_POST['register_password'] ?? '';
    
    // Basic validation
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        exit();
    }

    // Check if user already exists
    $stmt = $conn->prepare("SELECT id_usuario FROM usuarios WHERE email = ? OR nombre_usuario = ?");
    $stmt->bind_param("ss", $email, $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'El usuario o correo ya existen.']);
        $stmt->close();
        exit();
    }
    $stmt->close();

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert user
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre_usuario, email, hash_contrasena) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashed_password);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registro exitoso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar: ' . $stmt->error]);
    }
    $stmt->close();

} elseif ($action === 'login') {
    $usernameOrEmail = $_POST['login_username'] ?? '';
    $password = $_POST['login_password'] ?? '';

    if (empty($usernameOrEmail) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        exit();
    }

    // Initialize statement
    $stmt = $conn->prepare("SELECT id_usuario, hash_contrasena FROM usuarios WHERE nombre_usuario = ? OR email = ?");
    // Bind parameters: "ss" means two strings
    $stmt->bind_param("ss", $usernameOrEmail, $usernameOrEmail);
    
    // Execute query
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['hash_contrasena'])) {
            echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
    }
    $stmt->close();

} else {
    echo json_encode(['success' => false, 'message' => 'Acción no válida via POST.']);
}

$conn->close();
?>
