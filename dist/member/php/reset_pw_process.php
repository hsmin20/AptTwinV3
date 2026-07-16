<?php
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// DB 연결
$serverName = "1.220.107.66";
$connectionOptions = [
    "Database" => "APT_TWIN",
    "Uid" => "db_user",
    "PWD" => "dahan_2845@tech",
    "TrustServerCertificate" => "True"
];
$conn = sqlsrv_connect($serverName, $connectionOptions);
if ($conn === false) { 
    echo json_encode(["success" => false, "message" => "DB 연결 실패"]); 
    exit(); 
}

// POST 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = trim($_POST['token'] ?? '');
    $new_password = trim($_POST['new_password'] ?? '');
    $confirm_password = trim($_POST['confirm_password'] ?? '');

    if ($token === '') { echo json_encode(["success"=>false, "message"=>"토큰이 누락되었습니다."]); exit(); }
    if ($new_password === '' || $confirm_password === '') { echo json_encode(["success"=>false, "message"=>"비밀번호를 입력해주세요."]); exit(); }
    if ($new_password !== $confirm_password) { echo json_encode(["success"=>false, "message"=>"비밀번호가 일치하지 않습니다."]); exit(); }

    $query = "SELECT userid, email, token_expiry, reset_token FROM users WHERE reset_token = ?";
    $stmt = sqlsrv_query($conn, $query, [$token]);
    $user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
    if (!$user) { echo json_encode(["success"=>false, "message"=>"유효하지 않은 토큰입니다."]); exit(); }

    $current_time = new DateTime();
    $token_expiry = $user['token_expiry'];
    if (!$token_expiry instanceof DateTime) {
        $token_expiry = new DateTime($token_expiry);
    }
    if ($current_time > $token_expiry) { echo json_encode(["success"=>false, "message"=>"토큰이 만료되었습니다."]); exit(); }

    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    $updateQuery = "UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE userid = ?";
    sqlsrv_query($conn, $updateQuery, [$hashed_password, $user['userid']]);

    echo json_encode([
        "success" => true,
        "redirect" => "find_ok.html?email=" . urlencode($user['email'])
    ]);

    sqlsrv_free_stmt($stmt);
    sqlsrv_close($conn);
}
?>
