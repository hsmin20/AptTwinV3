<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$serverName = "1.220.107.66";
$connectionOptions = [
    "Database"=>"APT_TWIN",   // HydrogenDB가 아니라 APT_TWIN 쓰신다고 하셨으니 그대로 맞춤
    "Uid"=>"db_user",
    "PWD"=>"dahan_2845@tech",
    "CharacterSet"=>"UTF-8",
    "TrustServerCertificate"=>"True"
];
$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    die(json_encode(["success"=>false,"message"=>"DB 연결 실패", "error"=>sqlsrv_errors()]));
}

$name  = $_POST['name']  ?? '';
$email = $_POST['email'] ?? '';

if (trim($name) === '' || trim($email) === '') {
    echo json_encode(["success"=>false,"message"=>"이름과 이메일을 입력해주세요."]);
    exit;
}

// 사용자 확인
$sql = "SELECT userid FROM users WHERE name=? AND email=?";
$stmt = sqlsrv_query($conn, $sql, [$name, $email]);

if ($stmt === false) {
    echo json_encode(["success"=>false,"message"=>"쿼리 실행 오류", "error"=>sqlsrv_errors()]);
    exit;
}

if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $userid = $row['userid'];

    // 토큰 생성
    $token  = bin2hex(random_bytes(50));
    $expiry = date("Y-m-d H:i:s", strtotime('+1 hour'));

    // 토큰 저장
    $updateSql = "UPDATE users SET reset_token=?, token_expiry=? WHERE userid=?";
    $updateRes = sqlsrv_query($conn, $updateSql, [$token, $expiry, $userid]);

    if ($updateRes === false) {
        echo json_encode(["success"=>false,"message"=>"토큰 저장 실패", "error"=>sqlsrv_errors()]);
        exit;
    }

    // 재설정 링크
    $resetLink = "http://localhost:8080/member/reset_pw.html?token=$token";

    // 메일 내용
    $subject = "비밀번호 재설정 안내";
    $body    = "안녕하세요, {$name}님.\n\n비밀번호를 재설정하려면 아래 링크를 클릭하세요:\n$resetLink\n\n이 링크는 1시간 후 만료됩니다.";

    // 메일 발송
    require_once __DIR__ . "/../../sendmail.php";
    $sent = sendMail($email, $subject, $body);

    if ($sent) {
        echo json_encode([
            "success"=>true,
            "message"=>"비밀번호 재설정 링크가 이메일로 발송되었습니다.",
            "redirect"=>"find_ok.html?email=" . urlencode($email)
        ]);
    } else {
        echo json_encode(["success"=>false,"message"=>"메일 발송 실패 (SMTP 확인 필요)"]);
    }

} else {
    echo json_encode(["success"=>false,"message"=>"입력하신 정보와 일치하는 계정이 없습니다."]);
}

sqlsrv_close($conn);
?>
