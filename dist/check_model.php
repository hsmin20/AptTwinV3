<?php
header('Content-Type: application/json; charset=utf-8');

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
if (!$conn) {
    echo json_encode(["error" => "DB 연결 실패"]);
    exit;
}

// JS에서 보낸 데이터 받기
$input = json_decode(file_get_contents("php://input"), true);
$aptName = trim($input['apt_name'] ?? '');

if (!$aptName) {
    echo json_encode(["exists" => false]);
    exit;
}

// 단일 조회 (complex_name과 정확 매칭)
$sql = "SELECT model_id, model_json, size_m2, type FROM [APT_TWIN].[dbo].[ModelHouses] WHERE complex_name = ?";
$params = [$aptName];
$stmt = sqlsrv_query($conn, $sql, $params);
if ($stmt === false) {
    echo json_encode(["error" => "쿼리 실패"]);
    exit;
}

if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    echo json_encode([
        "exists" => true,
        "model_id" => $row['model_id'],
        "model_json" => $row['model_json'],
        "size_m2" => $row['size_m2'],
        "type" => $row['type']
    ]);
} else {
    echo json_encode(["exists" => false]);
}

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>
