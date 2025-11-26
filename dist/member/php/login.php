<?php

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();
header('Content-Type: application/json');

// ★ 추가: 강제로 세션 쿠키 다시 내려주기
setcookie(session_name(), session_id(), [
    'expires' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

// DB 연결
$serverName = "1.220.107.66";
$connectionOptions = array(
    "Database" => "APT_TWIN",
    "Uid" => "db_user",
    "PWD" => "dahan_2845@tech",
    "CharacterSet" => "UTF-8",
    "TrustServerCertificate" => "True"
);

$conn = sqlsrv_connect($serverName, $connectionOptions);
if ($conn === false) {
    die(json_encode(["success" => false, "message" => "DB 연결 실패"]));
}

// POST 데이터 받기
$userid = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($userid) || empty($password)) {
    echo json_encode(["success" => false, "message" => "아이디와 비밀번호를 입력해주세요."]);
    exit();
}

// DB에서 해당 유저 조회
$sql = "SELECT userid, password FROM users WHERE userid = ?";
$params = array($userid);
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    die(json_encode(["success" => false, "message" => "쿼리 실행 실패"]));
}

$user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if ($user) {
    if (password_verify($password, $user['password'])) {
        $_SESSION['userid'] = $user['userid'];

        echo json_encode([
            "success" => true,
            "userid" => $user['userid'],
            "message" => "로그인 성공",
            "session_id" => session_id()
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "비밀번호가 올바르지 않습니다."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "존재하지 않는 아이디입니다."]);
}

sqlsrv_close($conn);
?>
