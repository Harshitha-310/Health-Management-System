<?php
include('db_connection.php');

// Fetch available doctors for dropdown
$doctor_query = "SELECT doctor_id, name, specialization FROM Doctors WHERE is_available = TRUE";
$doctor_result = $conn->query($doctor_query);

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and validate inputs
    $doctor_id = mysqli_real_escape_string($conn, $_POST['doctor_id']);
    $appointment_date = mysqli_real_escape_string($conn, $_POST['appointment_date']);
    $appointment_time = mysqli_real_escape_string($conn, $_POST['appointment_time']);
    $reason = mysqli_real_escape_string($conn, $_POST['reason']);
    $student_id = isset($_POST['student_id']) ? mysqli_real_escape_string($conn, $_POST['student_id']) : 1; // Default for testing
    
    // Use prepared statement
    $stmt = $conn->prepare("INSERT INTO Appointments (student_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iisss", $student_id, $doctor_id, $appointment_date, $appointment_time, $reason);
    
    if ($stmt->execute()) {
        echo "<div style='color: green; font-weight: bold;'>Appointment booked successfully!</div>";
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
    <title>Book Appointment - Health Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Book Appointment</h1>
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
        <h2>Choose a Doctor and Book an Appointment</h2>
        <form action="appointment.php" method="POST">
            <!-- For testing purposes, ask for student ID -->
            <label for="student_id">Your Student ID:</label>
            <input type="number" id="student_id" name="student_id" required><br><br>
            
            <label for="doctor_id">Select Doctor:</label>
            <select id="doctor_id" name="doctor_id" required>
                <?php
                if ($doctor_result->num_rows > 0) {
                    while ($row = $doctor_result->fetch_assoc()) {
                        echo "<option value='" . $row['doctor_id'] . "'>" . $row['name'] . " (" . $row['specialization'] . ")</option>";
                    }
                } else {
                    echo "<option value=''>No doctors available</option>";
                }
                ?>
            </select><br><br>

            <label for="appointment_date">Select Date:</label>
            <input type="date" id="appointment_date" name="appointment_date" required><br><br>
            
            <label for="appointment_time">Select Time:</label>
            <input type="time" id="appointment_time" name="appointment_time" required><br><br>
            
            <label for="reason">Reason for Visit:</label>
            <textarea id="reason" name="reason" rows="3"></textarea><br><br>

            <input type="submit" value="Book Appointment">
        </form>
    </section>

    <footer>
        <p>&copy; 2025 VNIT Nagpur</p>
    </footer>
</body>
</html>