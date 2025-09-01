<?php
    function downloadData($tblname, $userid) {
		$host = '1.220.107.66';
		$user = 'db_user';
		$pass = 'dahan_2845@tech';
		$dbname = 'APT_TWIN';

        $colname = 'model';
	
        // mssql
        $connectionInfo = array("UID"=>$user, "PWD"=>$pass, "Database"=>$dbname, "TrustServerCertificate" => "True");
        $conn = sqlsrv_connect($host, $connectionInfo);
        $query = "select top 1 CAST(model as NVARCHAR(MAX)) from $tblname where userid='$userid' order by id desc";


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
    $userid = $_GET['userid'];

    downloadData($tblname, $userid);
?>