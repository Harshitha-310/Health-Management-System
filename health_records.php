<?php
include('db_connection.php');

$records = [];
$error_message = "";

if (isset($_GET['student_id']) && !empty($_GET['student_id'])) {
    $student_id = mysqli_real_escape_string($conn, $_GET['student_id']);
    
    // Use prepared statement for security
    $stmt = $conn->prepare("SELECT hr.date_of_visit, hr.diagnosis, hr.treatment, d.name as doctor_name 
                           FROM HealthRecords hr 
                           JOIN Doctors d ON hr.doctor_id = d.doctor_id 
                           WHERE hr.student_id = ?");
    $stmt->bind_param("i", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
        }
    } else {
        $error_message = "No health records found for this student ID.";
    }
    
    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Records - Health Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Your Health Records</h1>
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
        <h2>Your Medical History</h2>
        
        <form action="health_records.php" method="GET">
            <label for="student_id">Enter Student ID:</label>
            <input type="number" id="student_id" name="student_id" value="<?php echo isset($_GET['student_id']) ? $_GET['student_id'] : ''; ?>" required>
            <input type="submit" value="View Records">
        </form>
        
        <?php if (!empty($error_message)): ?>
            <p style="color: red;"><?php echo $error_message; ?></p>
        <?php endif; ?>
        
        <?php if (!empty($records)): ?>
            <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <th style="padding: 10px;">Date</th>
                    <th style="padding: 10px;">Doctor</th>
                    <th style="padding: 10px;">Diagnosis</th>
                    <th style="padding: 10px;">Treatment</th>
                </tr>
                
                <?php foreach ($records as $record): ?>
                    <tr>
                        <td style="padding: 10px;"><?php echo $record['date_of_visit']; ?></td>
                        <td style="padding: 10px;"><?php echo $record['doctor_name']; ?></td>
                        <td style="padding: 10px;"><?php echo $record['diagnosis']; ?></td>
                        <td style="padding: 10px;"><?php echo $record['treatment']; ?></td>
                    </tr>
                <?php endforeach; ?>
            </table>
        <?php endif; ?>
    </section>

    <footer>
        <p>&copy; 2025 VNIT Nagpur</p>
    </footer>
</body>
</html>