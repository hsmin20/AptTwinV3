<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "logged_in" => isset($_SESSION['userid']),
    "userid" => $_SESSION['userid'] ?? null,
    "session_id" => session_id()
]);
?>
