<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// 출력 전에 세션 cookie 파라미터를 맞춤(옵션)
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

// 이제 세션 시작
session_start();

$response = [
    'logged_in' => isset($_SESSION['userid']),
    'userid' => $_SESSION['userid'] ?? null,
    'session_name' => session_name(),
    'session_id_server' => session_id(),
    'cookies' => $_COOKIE,
    'session_save_path' => session_save_path(),
    'session_status' => session_status() // 2 = PHP_SESSION_ACTIVE
];

// 추가: 모든 incoming request headers (fast way)
if (function_exists('getallheaders')) {
    $response['request_headers'] = getallheaders();
}

echo json_encode($response, JSON_PRETTY_PRINT);
