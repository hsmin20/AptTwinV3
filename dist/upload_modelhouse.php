<?php
    // These functions are for older Editor-oriented upload functions.
    function uploadModelHouseData($complexName, $address, $size, $type, $companyName, $comment) {
        include("mssql_connect.php");

        $conn = sqlsrv_connect($host, $connectionInfo);

        $query = "INSERT INTO ModelHouses (complex_name, size_m2, type, company_name, address, comment) VALUES ('$complexName', '$size', '$type', '$companyName', '$address', '$comment')";

		$result = sqlsrv_query($conn, $query);

        if( $result === false) {
            $error_msg = sqlsrv_errors();
            die( print_r( $error_msg(), true) );
        }

        sqlsrv_free_stmt( $result);
        sqlsrv_close( $conn);  
    }

    // JS에서 보낸 데이터 받기
    $input = json_decode(file_get_contents("php://input"), true);

    $complex_name = trim($input['complex_name'] ?? '');
    $address = trim($input['address'] ?? '');
    $size_m2 = trim($input['size_m2'] ?? '');
    $type = trim($input['type'] ?? '');
    $company_name = trim($input['company_name'] ?? '');
    $comment = trim($input['comment'] ?? '');

    uploadModelHouseData($complex_name, $address, $size_m2, $type, $company_name, $comment);
?>