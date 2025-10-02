<?php

header("Content-Type: text/html; charset=UTF-8");

// 데이터베이스 연결 정보
$serverName = "1.220.107.66"; // 데이터베이스 서버
$connectionOptions = array(
    "Database" => "APT_TWIN", // 데이터베이스 이름
    "Uid" => "db_user",           // 사용자 이름
    "PWD" => "dahan_2845@tech" , // 비밀번호
    "CharacterSet" => "UTF-8",
    "TrustServerCertificate" => "True"        
);

// 연결 시도
$conn = sqlsrv_connect($serverName, $connectionOptions);

// POST로 받은 데이터
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 폼 데이터 받기
    $userid = trim($_POST['userid']);
    $password = $_POST['password'];
    $password2 = $_POST['password2'];
    $name = trim($_POST['name']);
    $address = trim($_POST['address']);
    $emailId = trim($_POST['email_id']);
    $emailDomain = trim($_POST['email_domain']);
    $phone = trim($_POST['phone']);

    // 필수 입력 항목 확인
    if (empty($userid) || empty($password) || empty($password2) || empty($name) || empty($address) || empty($emailId) || empty($emailDomain) || empty($phone)) {
        echo "<script>alert('모든 필드를 입력해 주세요.'); history.back();</script>";
        exit();
    }

    // 비밀번호와 비밀번호 확인이 일치하는지 체크
    if ($password !== $password2) {
        echo "<script>alert('비밀번호가 일치하지 않습니다.'); history.back();</script>";
        exit();
    }

    // ID 중복 확인
    $checkSql = "SELECT COUNT(*) AS count FROM users WHERE userid = ?";
    $checkParams = array($userid);
    $checkStmt = sqlsrv_query($conn, $checkSql, $checkParams);

    if ($checkStmt === false) {
        die(print_r(sqlsrv_errors(), true));
    }

    $row = sqlsrv_fetch_array($checkStmt, SQLSRV_FETCH_ASSOC);
    
    if ($row['count'] > 0) {
        echo "<script>alert('중복된 아이디가 있습니다.'); history.back();</script>";
        exit();
    }

    // 비밀번호 해시화
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 이메일 합치기
    $email = $emailId . '@' . $emailDomain;

    // 데이터 삽입 쿼리
    $sql = "INSERT INTO users (userid, password, name, address, email, phone, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, GETDATE())";
    $params = array($userid, $hashedPassword, $name, $address, $email, $phone);

    // 실행
    $stmt = sqlsrv_query($conn, $sql, $params);

    if ($stmt === false) {
        die(print_r(sqlsrv_errors(), true));
    } else {
        echo "<script>alert('회원가입이 완료되었습니다.'); window.location.href = '../login.html';</script>";
    }

    // 연결 종료
    sqlsrv_close($conn);
}
?>
