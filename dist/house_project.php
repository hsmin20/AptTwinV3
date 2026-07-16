<?php
session_start();

// 로그인 여부 확인
if (!isset($_SESSION['userid'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$userid = $_SESSION['userid'];

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
$sql = "
SELECT h.house_id, h.house_name, h.updated_at, m.model_image
FROM Houses h
LEFT JOIN ModelHouses m ON h.model_id = m.model_id
WHERE h.userid = ?
ORDER BY h.updated_at DESC
";

$params = array($userid);
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode(["error" => "Query failed"]);
    die(print_r(sqlsrv_errors(), true));
}

$projects = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $updated = $row['updated_at'] instanceof DateTime ? $row['updated_at']->format('Y-m-d H:i:s') : null;

    // 이미지가 있으면 Base64로 변환
    $imageData = $row['model_image'] ? 'data:image/jpeg;base64,' . base64_encode($row['model_image']) : null;

    $projects[] = [
        "house_id" => $row['house_id'],
        "house_name" => $row['house_name'],
        "updated_at" => $updated,
        "image" => $imageData
    ];
}

echo json_encode($projects, JSON_UNESCAPED_UNICODE);

// 연결 해제
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
?>
