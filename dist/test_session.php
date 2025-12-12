<?php
session_start();
$_SESSION['test'] = "OK";

echo "<pre>";
echo "session_id: " . session_id() . "\n";
echo "save_path: " . ini_get("session.save_path") . "\n";
echo "</pre>";
?>