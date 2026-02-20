<?php
    function downloadFloorPlanData($model_id) {
		include("mssql_connect.php");
    
        $conn = sqlsrv_connect($host, $connectionInfo);
        
        $query = "select CAST(floorplan_json as NVARCHAR(MAX)) from ModelHouses where model_id=$model_id";

		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            die( print_r( sqlsrv_errors(), true) );
        }

        // $data = sqlsrv_get_field( $result, 0);
        $row = sqlsrv_fetch_array( $result, SQLSRV_FETCH_NUMERIC);
        $data = $row[0];

        echo $data;

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    $model_id = $_GET['model_id'];

    downloadFloorPlanData($model_id);
?>