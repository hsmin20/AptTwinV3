<?php
    function getData($tblname) {
		$host = '1.220.107.66';
		$user = 'db_user';
		$pass = 'dahan_2845@tech';
		$dbname = 'APT_TWIN';
	
        // mssql
        $connectionInfo = array("UID"=>$user, "PWD"=>$pass, "Database"=>$dbname, "TrustServerCertificate" => "True");
        $conn = sqlsrv_connect($host, $connectionInfo);
       
        $query = "SELECT Top 1 light, door, window, util FROM $tblname order by newid()";
		
		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            die( print_r( sqlsrv_errors(), true) );
        }
		
		$colNames = [ "light", "door", "window", "util" ];
        $noOfCols = count($colNames);
        $data = "";
        while( $row = sqlsrv_fetch_array( $result, SQLSRV_FETCH_NUMERIC))  
        {
            $data .= "{";
            for($i=0; $i<$noOfCols; $i++) {
                $data .= "\"".$colNames[$i]."\"".": ".$row[$i];
                if($i != ($noOfCols-1))
                    $data .= ",";
            }
            $data .= "},";
        }
        $data = rtrim($data, ",");

        echo $data;

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    $tblname = $_GET['tblname'];

    getData($tblname);
?>