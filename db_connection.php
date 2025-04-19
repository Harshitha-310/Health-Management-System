<?php
$servername = "localhost";  // Change to your server
$username = "root";         // Change to your database username
$password = "";             // Change to your database password
$dbname = "harshidb";       // Changed to match your SQL file database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>