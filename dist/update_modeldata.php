<?php
    function updateModelHouseData($model_id, $complexName, $size, $type, $companyName, $address, $data, $comment) {
        include("mssql_connect.php");

        $conn = sqlsrv_connect($host, $connectionInfo);

        $query = "UPDATE ModelHouses Set company_name='$companyName', address='$address', model_json='$data', updated_at=GetDate(), comment='$comment' where model_id='$model_id'";

        $result = sqlsrv_query($conn, $query);

        if( $result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    $tblname = $_GET['tblname'];
    $model_id = $_GET['model_id'];

    $json = file_get_contents('php://input');
    $jsonObj = json_decode($json, true);

    $complexName = $jsonObj["scene"]["object"]["userData"]["complexName"];
    $size = $jsonObj["scene"]["object"]["userData"]["size"];
    $type = $jsonObj["scene"]["object"]["userData"]["type"];
    $companyName = $jsonObj["scene"]["object"]["userData"]["companyName"];
    $address = $jsonObj["scene"]["object"]["userData"]["address"];
    $comment = $jsonObj["scene"]["object"]["userData"]["comment"];

    updateModelHouseData($model_id, $complexName, $size, $type, $companyName, $address, $json, $comment);
?>