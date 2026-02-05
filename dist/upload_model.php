<?php
    // These functions are for older Editor-oriented upload functions.
    
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

    function uploadHouseData($house_id, $nickName, $data, $comment2, $model_id, $userId) {
		include("mssql_connect.php");

        $conn = sqlsrv_connect($host, $connectionInfo);
        $query = "";
        if($house_id == null || $house_id == "null")
            $query = "INSERT INTO Houses (house_name, model_json, comment, model_id, userid) VALUES ('$nickName', '$data', '$comment2', '$model_id', '$userId'); 
            SELECT SCOPE_IDENTITY() as house_id;";
        else
            $query = "UPDATE Houses SET model_json='$data', updated_at=GetDate() WHERE house_id = $house_id; select scope_identity() as house_id;";

		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        // next_result is NEEDED!
        $next_result = sqlsrv_next_result($result); 
        if( $next_result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        $row = sqlsrv_fetch_array( $result, SQLSRV_FETCH_NUMERIC);
        $newID = $row[0];

        echo $newID;

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
        $userId = $_GET['userId'];
        $model_id = $_GET['model_id'];
        $house_id = $_GET['house_id'];
        $nickName = $jsonObj["scene"]["object"]["userData"]["nickName"];
        $comment2 = $jsonObj["scene"]["object"]["userData"]["comment2"];
        
        uploadHouseData($house_id, $nickName, $json, $comment2, $model_id, $userId);
    }
?>