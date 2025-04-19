<?php
include('db_connection.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and validate inputs
    $student_id = mysqli_real_escape_string($conn, $_POST['student_id']);
    $description = mysqli_real_escape_string($conn, $_POST['description']);
    
    // Use prepared statement
    $stmt = $conn->prepare("INSERT INTO EmergencyAlerts (student_id, description) VALUES (?, ?)");
    $stmt->bind_param("is", $student_id, $description);
    
    if ($stmt->execute()) {
        echo "<div style='color: green; font-weight: bold;'>Emergency alert sent successfully!</div>";
    } else {
        echo "<div style='color: red; font-weight: bold;'>Error: " . $stmt->error . "</div>";
    }
    
    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emergency Alerts - Health Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Emergency Alerts</h1>
    </header>

    <nav>
        <ul>
            <li><a href="index.html">Back to Home</a></li>
            <li><a href="register.php">Register</a></li>
            <li><a href="appointment.php">Book Appointment</a></li>
            <li><a href="health_records.php">Health Records</a></li>
            <li><a href="doctor_availability.php">Doctor Availability</a></li>
            <li><a href="emergency_alerts.php">Emergency Alerts</a></li>
        </ul>
    </nav>

    <section>
        <h2>Emergency Alerts</h2>
        <p>If you are experiencing an emergency, please alert us immediately by filling out the form below.</p>
        
        <form action="emergency_alerts.php" method="POST">
            <label for="student_id">Student ID:</label>
            <input type="number" id="student_id" name="student_id" required><br><br>
            
            <label for="description">Emergency Description:</label>
            <textarea id="description" name="description" rows="5" cols="50" required></textarea><br><br>
            
            <input type="submit" value="Send Emergency Alert" style="background-color: #f44336; color: white; padding: 10px 15px; border: none; cursor: pointer;">
        </form>
    </section>

    <footer>
        <p>&copy; 2025 VNIT Nagpur</p>
    </footer>
</body>
</html>
