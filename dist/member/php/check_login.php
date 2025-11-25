<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "logged_in" => isset($_SESSION['userid']),
    "userid" => $_SESSION['userid'] ?? null,
    "session_id" => session_id()
]);
?>
