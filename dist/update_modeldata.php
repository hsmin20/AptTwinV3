<?php
    function updateModelHouseData($model_id, $data) {
        include("mssql_connect.php");

        $conn = sqlsrv_connect($host, $connectionInfo);

        $query = "UPDATE ModelHouses Set model_json='$data', updated_at=GetDate() where model_id='$model_id'";

        $result = sqlsrv_query($conn, $query);

        if( $result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    $model_id = $_GET['model_id'];

    $json = file_get_contents('php://input');
    $jsonObj = json_decode($json, true);

    updateModelHouseData($model_id, $json);
?>