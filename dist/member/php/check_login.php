<?php
// debug_check_login.php — 임시로 이 파일을 만들어서 접속해라
// (원본 check_login.php 대신 잠깐 사용)

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// 출력 전에 세션 cookie 파라미터를 맞춤(옵션)
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    // samesite는 php설정에 따라 다름 — 개발환경이면 Lax 권장
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
