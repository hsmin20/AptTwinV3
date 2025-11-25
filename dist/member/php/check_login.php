<?php
session_start();

header('Content-Type: application/json');

echo json_encode([
    "logged_in" => isset($_SESSION['userid']),
    "userid" => $_SESSION['userid'] ?? null,
    "session_id" => session_id()
]);
