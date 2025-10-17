<?php
    function getData($tblname, $house_id) {
		$host = '1.220.107.66';
		$user = 'db_user';
		$pass = 'dahan_2845@tech';
		$dbname = 'APT_TWIN';
	
        // mssql
        $connectionInfo = array("UID"=>$user, "PWD"=>$pass, "Database"=>$dbname, "TrustServerCertificate" => "True", "CharacterSet" => "UTF-8");
        $conn = sqlsrv_connect($host, $connectionInfo);
       
        $query = "SELECT Top 1 light1,light2,light3,light4,light5,light6,light7,light8,light9,light10,
                                light11,light12,light13,light14,light15,light16,light17,light18,light19,light20,
                                door1,door2,door3,door4,door5,door6,door7,door8,door9,door10,
                                window1,window2,window3,window4,window5,window6,window7,window8,window9,window10,
                                util1,util2,util3,util4,util5,util6,util7,util8,util9,util10,
                                moving1x,moving1z,moving1ry,moving2x,moving2z,moving2ry,moving3x,moving3z,moving3ry,
                                moving4x,moving4z,moving4ry,moving5x,moving5z,moving5ry FROM $tblname WHERE house_id=$house_id 
                                order by newid()";
		
		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            die( print_r( sqlsrv_errors(), true) );
        }
		
		$colNames = [];
        for($i=1; $i<=20; $i++) {
            array_push($colNames, "light".$i."");
        }
        for($i=1; $i<=10; $i++) {
            array_push($colNames, "door".$i."");
        }
        for($i=1; $i<=10; $i++) {
            array_push($colNames, "window".$i."");
        }
        for($i=1; $i<=10; $i++) {
            array_push($colNames, "util".$i."");
        }
        for($i=1; $i<=5; $i++) {
            array_push($colNames, "moving".$i."x");
            array_push($colNames, "moving".$i."z");
            array_push($colNames, "moving".$i."ry");
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
    $house_id = $_GET['house_id'];

    getData($tblname, $house_id);
?>