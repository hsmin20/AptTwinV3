<?php
    // These functions are for older Editor-oriented upload functions.
    function uploadFloorPlan($model_id, $data) {
        include("mssql_connect.php");

        $conn = sqlsrv_connect($host, $connectionInfo);

        $query = "Update ModelHouses set floorplan_json='$data' WHERE model_id='$model_id'";

		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    // JS에서 보낸 데이터 받기
    $model_id = $_GET['model_id'];
    $data = json_decode(file_get_contents("php://input"), true);

    uploadFloorPlan($model_id, $data);
?>