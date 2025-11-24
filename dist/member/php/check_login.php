<?php
ini_set('session.cookie_samesite', 'None');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'None'
]);

session_start();

header('Content-Type: application/json; charset=utf-8');

// 세션에 로그인 정보가 없으면 false 반환
if (!isset($_SESSION['userid'])) {
    echo json_encode(['logged_in' => false]);
    exit;
}

// 로그인된 상태라면 true 반환
echo json_encode(['logged_in' => true, 'userid' => $_SESSION['userid']]);
?>
