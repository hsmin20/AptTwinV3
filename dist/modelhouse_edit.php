<?php
session_start();

// 로그인 여부 확인
if (!isset($_SESSION['userid'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$userid = $_SESSION['userid'];
$model_id = $_GET['model_id'];

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

// ModelHouses
$sql = "SELECT complex_name, address, size_m2, type, company_name, comment, model_image FROM ModelHouses WHERE model_id = ?";

$params = array($model_id);
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode(["error" => "Query failed"]);
    die(print_r(sqlsrv_errors(), true));
}

$projects = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    // 이미지가 있으면 Base64로 변환
    $imageData = $row['model_image'] ? 'data:image/jpeg;base64,' . base64_encode($row['model_image']) : null;

    $projects[] = [
        "complex_name" => $row['complex_name'],
        "address" => $row['address'],
        "size_m2" => $row['size_m2'],
        "type" => $row['type'],
        "company_name" => $row['company_name'],
        "comment" => $row['comment'],
        "image" => $imageData
    ];
}

echo json_encode($projects, JSON_UNESCAPED_UNICODE);

// 연결 해제
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>
