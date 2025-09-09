<?php
session_start();

header("Access-Control-Allow-Origin: *");

$valid_user = "test";
$valid_pass = "1234";

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($username === $valid_user && $password === $valid_pass) {
    $_SESSION['userid'] = $username;
    echo "로그인 성공: 환영합니다 $username 님!";
} else {
    echo "로그인 실패: 아이디 또는 비밀번호가 올바르지 않습니다.";
}
?>
