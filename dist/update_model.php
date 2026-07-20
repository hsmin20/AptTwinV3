<?php
    function updateData($house_id) {
		include("mssql_connect.php");
    
        $conn = sqlsrv_connect($host, $connectionInfo);

        // Get the ModelHouse ID
        $query = "select model_id from Houses where house_id=$house_id";
        $result = sqlsrv_query($conn, $query);

        if( $result === false) {
            die( print_r( sqlsrv_errors(), true) );
        }

        // $data = sqlsrv_get_field( $result, 0);
        $row = sqlsrv_fetch_array( $result, SQLSRV_FETCH_NUMERIC);
        $model_id = $row[0];

        sqlsrv_free_stmt( $result);

        $query = "select CAST(model_json as NVARCHAR(MAX)) from ModelHouses where model_id=$model_id";

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

    $house_id = $_GET['house_id'];

    updateData($house_id);
?>