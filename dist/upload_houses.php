<?php
header('Content-Type: application/json; charset=utf-8');
include("mssql_connect.php"); // 기존 DB 연결 정보 포함

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['error' => '잘못된 데이터']);
    exit;
}

$house_id = $data['house_id'] ?? null;
// $house_size = $data['house_size'] ?? null;
$house_name = $data['nickName'] ?? '';
$model_json = $data['data'] ?? '';
$comment = $data['comment2'] ?? '';
$model_id = $data['model_id'] ?? null;
$userid = $data['userId'] ?? null;

$conn = sqlsrv_connect($host, $connectionInfo);
if (!$conn) {
    echo json_encode(['error' => 'DB 연결 실패']);
    exit;
}

if ($house_id === null || $house_id === "null") {
    $query = "INSERT INTO Houses (house_name, model_json, comment, model_id, userid) 
              VALUES (?, ?, ?, ?, ?); SELECT SCOPE_IDENTITY() as house_id;";
    $params = [$house_name, $model_json, $comment, $model_id, $userid];
} else {
    $query = "UPDATE Houses 
              SET house_name=?, model_json=?, comment=?, model_id=?, userid=?, updated_at=GETDATE() 
              WHERE house_id=?; SELECT SCOPE_IDENTITY() as house_id;";
    $params = [$house_name, $model_json, $comment, $model_id, $userid, $house_id];
}

$stmt = sqlsrv_query($conn, $query, $params);
if ($stmt === false) {
    $errors = sqlsrv_errors();
    echo json_encode(['error' => $errors]);
    exit;
}

// next_result 필수
sqlsrv_next_result($stmt);
$row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
$newHouseId = $row['house_id'] ?? null;

sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);

echo json_encode(['house_id' => $newHouseId]);
?>
