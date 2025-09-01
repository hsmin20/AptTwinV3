<?php
    function uploadData($tblname, $userid, $data) {
		$host = '1.220.107.66';
		$user = 'db_user';
		$pass = 'dahan_2845@tech';
		$dbname = 'APT_TWIN';
	
        // mssql
        $connectionInfo = array("UID"=>$user, "PWD"=>$pass, "Database"=>$dbname, "TrustServerCertificate" => "True");
        $conn = sqlsrv_connect($host, $connectionInfo);
        $query = "INSERT INTO $tblname (userid, model, date) VALUES ('$userid', '$data', GETDATE())";

		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            die( print_r( sqlsrv_errors(), true) );
        }

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    $tblname = $_GET['tblname'];
    $userid = $_GET['userid'];

    $json = file_get_contents('php://input');

    uploadData($tblname, $userid, $json);
?>