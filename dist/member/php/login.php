<?php

// *** 세션 시작은 최상단에서 즉시 ***
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,   // HTTP니까 false
    'httponly' => true,
    'samesite' => 'Lax'  // fetch + redirect 시 문제 없게 Lax
]);

session_start();

// ⚠️ 반드시 fetch 요청 전에 쿠키 내려야함
setcookie(session_name(), session_id(), [
    'expires' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

header('Content-Type: application/json');

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
    echo json_encode(["success" => false, "message" => "DB 연결 실패"]);
    exit;
}

// POST 데이터 받기
$userid = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (!$userid || !$password) {
    echo json_encode(["success" => false, "message" => "아이디 비밀번호 입력 필요"]);
    exit();
}

$sql = "SELECT userid, password FROM users WHERE userid = ?";
$stmt = sqlsrv_query($conn, [$userid]);

$user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['userid'] = $user['userid'];

    // ★ 확인용 출력
    echo json_encode([
        "success" => true,
        "userid" => $_SESSION['userid'],
        "session_id" => session_id(),
        "cookie_sent" => isset($_COOKIE[session_name()]) ? "브라우저가 쿠키 읽음" : "쿠키 서버만 생성됨"
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => "아이디 또는 비번 오류"
    ]);
}

sqlsrv_close($conn);
?>
