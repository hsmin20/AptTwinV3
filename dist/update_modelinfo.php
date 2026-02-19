<?php
include("mssql_connect.php");

$conn = sqlsrv_connect($host, $connectionInfo);

$model_id = $_GET['model_id'];
$complexName = $_GET["complexName"];
$address = $_GET["address"];
$size = $_GET["size_m2"];
$type = $_GET["type"];
$companyName = $_GET["companyName"];
$comment = $_GET["comment"];

$query = "UPDATE ModelHouses Set complex_name='$complexName', address='$address', size_m2='$size', type='$type', updated_at=GetDate(), company_name='$companyName', comment='$comment' where model_id='$model_id'";

$result = sqlsrv_query($conn, $query);

if( $result === false) {
    $error_msg = sqlsrv_errors();
    die( print_r( $error_msg(), true) );
}

sqlsrv_free_stmt( $result);
sqlsrv_close( $conn);  
?>