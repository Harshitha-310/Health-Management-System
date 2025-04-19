<?php
include('db_connection.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize inputs to prevent SQL injection
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    
    // Assuming default values for other fields
    $gender = 'Other';
    $age = 20;
    $department = 'General';
    $roll_no = 'TMP' . rand(1000, 9999); // Generate a temporary roll number
    
    // Use prepared statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO Students (name, roll_no, gender, age, department, contact_no, email) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssisss", $name, $roll_no, $gender, $age, $department, $phone, $email);
    
    if ($stmt->execute()) {
        echo "<div style='color: green; font-weight: bold;'>Registration successful!</div>";
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
    <title>Register - Health Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Register for Health Management System</h1>
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
        <h2>Register New User</h2>
        <form action="register.php" method="POST">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required><br><br>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required><br><br>

            <label for="phone">Phone:</label>
            <input type="text" id="phone" name="phone" required><br><br>

            <input type="submit" value="Register">
        </form>
    </section>

    <footer>
        <p>&copy; 2025 VNIT Nagpur</p>
    </footer>
</body>
</html>