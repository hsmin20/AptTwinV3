<?php
    function getData($tblname) {
		$host = '1.220.107.66';
		$user = 'db_user';
		$pass = 'dahan_2845@tech';
		$dbname = 'APT_TWIN';
	
        // mssql
        $connectionInfo = array("UID"=>$user, "PWD"=>$pass, "Database"=>$dbname, "TrustServerCertificate" => "True");
        $conn = sqlsrv_connect($host, $connectionInfo);
       
        $query = "SELECT Top 1 lights0,lights1,lights2,lights3,lights4,lights5,lights6,lights7,lights8,lights9,doors0,doors1,doors2,
                                doors3,doors4,doors5,doors6,doors7,doors8,doors9,windows0,windows1,windows2,windows3,windows4,
                                windows5,windows6,windows7,windows8,windows9,utils0,utils1,utils2,utils3,utils4,utils5,utils6,utils7,
                                utils8,utils9,movings0x,movings0z,movings1x,movings1z,movings2x,movings2z,movings3x,movings3z,
                                movings4x,movings4z FROM $tblname order by newid()";
		
		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            die( print_r( sqlsrv_errors(), true) );
        }
		
		$colNames = [];
        for($i=0; $i<10; $i++) {
            array_push($colNames, "light".$i."");
        }
        for($i=0; $i<10; $i++) {
            array_push($colNames, "door".$i."");
        }
        for($i=0; $i<10; $i++) {
            array_push($colNames, "window".$i."");
        }
        for($i=0; $i<10; $i++) {
            array_push($colNames, "util".$i."");
        }
        for($i=0; $i<5; $i++) {
            array_push($colNames, "moving".$i."x");
            array_push($colNames, "moving".$i."z");
        }

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