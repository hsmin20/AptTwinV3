<?php
session_start();

// 로그인 여부 확인
if (!isset($_SESSION['userid'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$model_id = $_GET['model_id'];

// DB 연결 정보
// $serverName = "1.220.107.66";
// $connectionOptions = array(
//     "Database" => "APT_TWIN",
//     "Uid" => "db_user",
//     "PWD" => "dahan_2845@tech",
//     "CharacterSet" => "UTF-8",
//     "TrustServerCertificate" => "True"
// );

include("mssql_connect.php");

// DB 연결
$conn = sqlsrv_connect($host, $connectionInfo);

if ($conn === false) {
    echo json_encode(["error" => "DB connection failed"]);
    die(print_r(sqlsrv_errors(), true));
}

// Houses + ModelHouses JOIN
$sql = "DELETE FROM ModelHouses WHERE model_id = ?";

$params = array($model_id);
$stmt = sqlsrv_query($conn, $sql, $params);
if( $stmt === false ) {
    echo json_encode(["error" => "Query failed"]);
    die(print_r(sqlsrv_errors(), true));
} else {
    echo json_encode(["success" => "OK"]);
}

// 연결 해제
sqlsrv_close($conn);
?>
