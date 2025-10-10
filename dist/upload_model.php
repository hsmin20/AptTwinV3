<?php
    function uploadModelHouseData($complexName, $size, $type, $companyName, $address, $data, $comment) {
        include("mssql_connect.php");

        $conn = sqlsrv_connect($host, $connectionInfo);

        $query = "select model_id from ModelHouses where complex_name='$complexName' and size_m2='$size' and type='$type'";

		$result = sqlsrv_query($conn, $query);

        if($result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        $row = sqlsrv_fetch_array($result, SQLSRV_FETCH_NUMERIC);
        $model_id = $row[0];

        sqlsrv_free_stmt( $result);

        $query = "";
        if($model_id != null) {
            $query = "UPDATE ModelHouses Set company_name='$companyName', address='$address', model_json='$data', updated_at=GetDate(), comment='$comment' where model_id='$model_id'";
        } else {
           $query = "INSERT INTO ModelHouses (complex_name, size_m2, type, company_name, address, model_json, comment) VALUES ('$complexName', '$size', '$type', '$companyName', '$address', '$data', '$comment')";
        }

		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    function uploadHouseData($complexName, $companyName, $address, $type, $data, $comment) {
		include("mssql_connect.php");

        $conn = sqlsrv_connect($host, $connectionInfo);
        $query = "INSERT INTO Houses (complexName, companyName, address, type, model, comment) VALUES ('$complexName', '$companyName', '$address', '$type', '$data', '$comment')";

		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    $tblname = $_GET['tblname'];

    $json = file_get_contents('php://input');
    $jsonObj = json_decode($json, true);

    if($tblname == 'ModelHouses') {
        $complexName = $jsonObj["scene"]["object"]["userData"]["complexName"];
        $size = $jsonObj["scene"]["object"]["userData"]["size"];
        $type = $jsonObj["scene"]["object"]["userData"]["type"];
        $companyName = $jsonObj["scene"]["object"]["userData"]["companyName"];
        $address = $jsonObj["scene"]["object"]["userData"]["address"];
        $comment = $jsonObj["scene"]["object"]["userData"]["comment"];

        uploadModelHouseData($complexName, $size, $type, $companyName, $address, $json, $comment);
    } else if($tblname == 'Houses') {
        
    }
?>