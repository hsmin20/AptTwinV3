<?php
    function downloadData($tblname, $unique_id) {
		include("mssql_connect.php");
    
        $conn = sqlsrv_connect($host, $connectionInfo);
        $query = "";
        if($tblname == 'ModelHouses') {
            $query = "select CAST(model_json as NVARCHAR(MAX)) from $tblname where model_id=$unique_id";
        } else {
            $query = "select CAST(model_json as NVARCHAR(MAX)) from $tblname where house_id=$unique_id";
        }

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

    $tblname = $_GET['tblname'];
    $unique_id = -1;
    if($tblname == 'ModelHouses') {
        $unique_id = $_GET['model_id'];
    } else {
        $unique_id = $_GET['house_id'];
    }

    downloadData($tblname, $unique_id);
?>