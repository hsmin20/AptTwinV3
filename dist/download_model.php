<?php
    function downloadData($tblname) {
		include("mssql_connect.php");
    

        $conn = sqlsrv_connect($host, $connectionInfo);
        $query = "select top 1 CAST(model as NVARCHAR(MAX)) from $tblname order by id desc";

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

    downloadData($tblname);
?>