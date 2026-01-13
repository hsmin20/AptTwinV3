<?php
session_start();

// 로그인 여부 확인
if (!isset($_SESSION['userid'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$userid = $_SESSION['userid'];
$house_id = $_GET['house_id'];

// DB 연결 정보
$serverName = "1.220.107.66";
$connectionOptions = array(
    "Database" => "APT_TWIN",
    "Uid" => "db_user",
    "PWD" => "dahan_2845@tech",
    "CharacterSet" => "UTF-8",
    "TrustServerCertificate" => "True"
);

// DB 연결
$conn = sqlsrv_connect($serverName, $connectionOptions);
if ($conn === false) {
    echo json_encode(["error" => "DB connection failed"]);
    die(print_r(sqlsrv_errors(), true));
}

// Houses + ModelHouses JOIN
$sql = "DELETE FROM Houses WHERE userid = ? and house_id = ?";

$params = array($userid, $house_id);
sqlsrv_query($conn, $sql, $params);

// 연결 해제
sqlsrv_close($conn);
?>
