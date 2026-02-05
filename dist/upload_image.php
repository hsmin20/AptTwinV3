<?php
include("mssql_connect.php");

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES["imageFile"])) {

    $model_id = $_POST['model_id'];
    $file = $_FILES["imageFile"];

    $conn = sqlsrv_connect($host, $connectionInfo);

    // Process the uploaded file
    if ($file["error"] == UPLOAD_ERR_OK && str_contains($file['type'], 'image/')) {
        $filePath = $file["tmp_name"];
        $fileContent = file_get_contents($filePath); // Get the raw binary data

        try {
            // Prepare the insert statement
            $query = "UPDATE ModelHouses SET model_image=? WHERE model_id = ?";
            
            $params = array(array($fileContent, SQLSRV_PARAM_IN, SQLSRV_PHPTYPE_STREAM(SQLSRV_ENC_BINARY)), $model_id);

            $result = sqlsrv_query($conn, $query, $params);

            if( $result === false) {
                $error_msg = sqlsrv_errors();
                die( print_r( $error_msg, true) );
            }

            sqlsrv_free_stmt( $result);
            sqlsrv_close( $conn);

            echo "Image uploaded successfully.";
            $prevPage = $_SERVER ['HTTP_REFERER'];
            header('location:'. $prevPage);
        } catch (PDOException $e) {
            die("Error inserting the image: " . $e->getMessage());
        }
    } else {
        echo "Error during file upload.";
    }
} else {
    echo "No image file received.";
}
?>
