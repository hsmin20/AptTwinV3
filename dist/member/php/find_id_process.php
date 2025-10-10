<?php
header('Access-Control-Allow-Origin: *'); // dev용, 배포시 제한
header('Content-Type: application/json');

$serverName = "1.220.107.66";
$conn = sqlsrv_connect($serverName, ["Database"=>"APT_TWIN","Uid"=>"db_user","PWD"=>"dahan_2845@tech","CharacterSet"=>"UTF-8"]);

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';

if(trim($name)==='' || trim($email)==='') {
    echo json_encode(["success"=>false,"message"=>"이름과 이메일을 입력해주세요."]);
    exit;
}

$sql = "SELECT userid FROM users WHERE name=? AND email=?";
$stmt = sqlsrv_query($conn,$sql,[$name,$email]);

if($row = sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC)) {
    echo json_encode(["success"=>true,"message"=>"회원님의 아이디는: ".$row['userid']." 입니다."]);
} else {
    echo json_encode(["success"=>false,"message"=>"입력하신 정보와 일치하는 아이디가 없습니다."]);
}
sqlsrv_close($conn);
?>
