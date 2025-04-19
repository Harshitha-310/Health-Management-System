<?php
include('db_connection.php');

$sql = "SELECT name, specialization, IF(is_available = 1, 'Available', 'Not Available') AS availability_status FROM Doctors";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doctor Availability - Health Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Doctor Availability</h1>
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
        <h2>View Doctor's Availability</h2>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr>
                <th style="padding: 10px;">Doctor Name</th>
                <th style="padding: 10px;">Specialization</th>
                <th style="padding: 10px;">Availability</th>
            </tr>
            <?php
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    echo "<tr>";
                    echo "<td style='padding: 10px;'>" . $row['name'] . "</td>";
                    echo "<td style='padding: 10px;'>" . $row['specialization'] . "</td>";
                    echo "<td style='padding: 10px;'>" . $row['availability_status'] . "</td>";
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='3' style='text-align: center; padding: 10px;'>No doctors available.</td></tr>";
            }
            ?>
        </table>
    </section>

    <footer>
        <p>&copy; 2025 VNIT Nagpur</p>
    </footer>
</body>
</html>