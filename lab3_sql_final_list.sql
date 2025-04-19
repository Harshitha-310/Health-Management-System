drop database if exists harshidb;
create database harshidb;
show databases;
use harshidb;

-- Check if the table exists before dropping
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS EmergencyAlerts;
DROP TABLE IF EXISTS HealthRecords;
DROP TABLE IF EXISTS Appointments;
DROP TABLE IF EXISTS Doctors;
DROP TABLE IF EXISTS Students;
DROP TABLE IF EXISTS AuditLogs;

-- STEP 2: Students Table
CREATE TABLE Students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    roll_no VARCHAR(20) UNIQUE,
    gender ENUM('Male', 'Female', 'Other'),
    age INT,
    department VARCHAR(50),
    contact_no VARCHAR(15),
    email VARCHAR(100)
);

-- STEP 3: Doctors Table
CREATE TABLE Doctors (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    specialization VARCHAR(100),
    contact_no VARCHAR(15),
    email VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE
);

-- STEP 4: Appointments Table
CREATE TABLE Appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    doctor_id INT,
    appointment_date DATE,
    appointment_time TIME,
    reason TEXT,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE
);

-- STEP 5: Health Records Table
CREATE TABLE HealthRecords (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    doctor_id INT,
    diagnosis TEXT,
    treatment TEXT,
    date_of_visit DATE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id) ON DELETE CASCADE
);

-- STEP 6: Emergency Alerts Table
CREATE TABLE EmergencyAlerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    alert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

-- STEP 7: Notifications Table
CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50),
    action VARCHAR(10),
    student_id INT,
    action_time DATETIME
);


-- STEP 9: Trigger - Auto mark doctor unavailable if 5 appointments in a day
DELIMITER //
CREATE TRIGGER trg_doctor_capacity
AFTER INSERT ON Appointments
FOR EACH ROW
BEGIN
    DECLARE appt_count INT;
    SELECT COUNT(*) INTO appt_count
    FROM Appointments
    WHERE doctor_id = NEW.doctor_id AND appointment_date = NEW.appointment_date;

    IF appt_count >= 5 THEN
        UPDATE Doctors SET is_available = FALSE WHERE doctor_id = NEW.doctor_id;
    END IF;
END;
//
DELIMITER ;

-- STEP 10: Trigger - Auto mark appointment completed when health record is added
DELIMITER //
CREATE TRIGGER trg_update_appointment_status
AFTER INSERT ON HealthRecords
FOR EACH ROW
BEGIN
    UPDATE Appointments
    SET status = 'Completed'
    WHERE student_id = NEW.student_id
      AND doctor_id = NEW.doctor_id
      AND appointment_date = NEW.date_of_visit;
END;
//
DELIMITER ;

-- STEP 11: Trigger - Auto notify student when emergency alert is added
DELIMITER //
CREATE TRIGGER trg_emergency_notification
AFTER INSERT ON EmergencyAlerts
FOR EACH ROW
BEGIN
    INSERT INTO Notifications(student_id, message)
    VALUES (
        NEW.student_id,
        CONCAT(' Emergency reported at ', NOW(), ': ', NEW.description)
    );
END;
//
DELIMITER ;

-- STEP 12: Trigger - Log changes to tables
DELIMITER //
CREATE TRIGGER trg_students_insert
AFTER INSERT ON Students
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action, student_id, action_time)
    VALUES ('Students', 'INSERT', NEW.student_id, NOW());
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_students_update
AFTER UPDATE ON Students
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action, student_id, action_time)
    VALUES ('Students', 'UPDATE', NEW.student_id, NOW());
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_students_delete
AFTER DELETE ON Students
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action, student_id, action_time)
    VALUES ('Students', 'DELETE', OLD.student_id, NOW());
END;
//
DELIMITER ;

-- STEP 13: View - Student health summary
CREATE OR REPLACE VIEW vw_student_health_summary AS
SELECT 
    s.name AS student_name, 
    COUNT(h.record_id) AS total_visits,
    MAX(h.date_of_visit) AS last_visit, 
    GROUP_CONCAT(DISTINCT d.name) AS consulted_doctors
FROM Students s
LEFT JOIN HealthRecords h ON s.student_id = h.student_id
LEFT JOIN Doctors d ON h.doctor_id = d.doctor_id
GROUP BY s.student_id;

-- STEP 14: Sample Join Query - Upcoming Appointments
-- For dashboard or frontend
SELECT 
    a.appointment_date, 
    a.appointment_time, 
    s.name AS student, 
    d.name AS doctor
FROM Appointments a
JOIN Students s ON a.student_id = s.student_id
JOIN Doctors d ON a.doctor_id = d.doctor_id
WHERE a.status = 'Scheduled' AND a.appointment_date >= CURDATE()
ORDER BY a.appointment_date, a.appointment_time;

-- STEP 15: Subquery - Students who have consulted every doctor
SELECT s.name
FROM Students s
WHERE NOT EXISTS (
    SELECT d.doctor_id 
    FROM Doctors d
    WHERE NOT EXISTS (
        SELECT 1 
        FROM HealthRecords h
        WHERE h.student_id = s.student_id AND h.doctor_id = d.doctor_id
    )
);

-- STEP 16: Doctor Appointment Summary (Analytics)
SELECT 
    d.name AS doctor, 
    COUNT(a.appointment_id) AS total_appointments,
    SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN a.status = 'Scheduled' THEN 1 ELSE 0 END) AS upcoming
FROM Doctors d
LEFT JOIN Appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.doctor_id;

-- Send a reminder 1 day before the appointment (assuming this is scheduled via a job/event)
DELIMITER //
CREATE EVENT IF NOT EXISTS ev_appointment_reminder
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    INSERT INTO Notifications(student_id, message)
    SELECT student_id, CONCAT('Reminder: You have an appointment with Dr. ', d.name, ' on ', a.appointment_date, ' at ', a.appointment_time)
    FROM Appointments a
    JOIN Doctors d ON a.doctor_id = d.doctor_id
    WHERE a.status = 'Scheduled'
      AND a.appointment_date = CURDATE() + INTERVAL 1 DAY;
END;
//
DELIMITER ;

CREATE OR REPLACE VIEW vw_student_health_analytics AS
SELECT 
    s.name,
    s.roll_no,
    COUNT(hr.record_id) AS total_visits,
    MAX(hr.date_of_visit) AS last_visit,
    ROUND(AVG(DATEDIFF(CURDATE(), hr.date_of_visit)), 2) AS avg_days_since_last_checkup
FROM Students s
LEFT JOIN HealthRecords hr ON s.student_id = hr.student_id
GROUP BY s.student_id;

CREATE OR REPLACE VIEW vw_doctor_daily_workload AS
SELECT 
    d.name AS doctor_name,
    a.appointment_date,
    COUNT(*) AS total_appointments_today,
    SUM(CASE WHEN a.status = 'Scheduled' THEN 1 ELSE 0 END) AS remaining,
    MAX(a.appointment_time) AS last_slot
FROM Doctors d
LEFT JOIN Appointments a ON d.doctor_id = a.doctor_id
WHERE a.appointment_date = CURDATE()
GROUP BY d.doctor_id, a.appointment_date;

-- Table to support system-wide messages
CREATE TABLE BroadcastMessages (
    broadcast_id INT PRIMARY KEY AUTO_INCREMENT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to notify all students
DELIMITER //
CREATE TRIGGER trg_broadcast_to_students
AFTER INSERT ON BroadcastMessages
FOR EACH ROW
BEGIN
    INSERT INTO Notifications(student_id, message)
    SELECT student_id, NEW.message FROM Students;
END;
//
DELIMITER ;

-- Track missed appointments (assuming no health record added on the date)
CREATE OR REPLACE VIEW vw_missed_appointments AS
SELECT 
    a.student_id, 
    s.name, 
    a.appointment_date, 
    a.status
FROM Appointments a
JOIN Students s ON s.student_id = a.student_id
LEFT JOIN HealthRecords h ON h.student_id = a.student_id 
    AND h.date_of_visit = a.appointment_date
WHERE a.status != 'Completed' AND h.record_id IS NULL AND a.appointment_date < CURDATE();

DELIMITER //
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT ON Appointments
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM Appointments 
        WHERE student_id = NEW.student_id 
        AND appointment_date = NEW.appointment_date 
        AND appointment_time = NEW.appointment_time
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Double booking detected!';
    END IF;
END;
//
DELIMITER ;

INSERT INTO Students (name, roll_no, gender, age, department, contact_no, email)
VALUES 
('Alice Johnson', 'S001', 'Female', 20, 'Computer Science', '1234567890', 'alice@example.com'),
('Bob Smith', 'S002', 'Male', 21, 'Electronics', '2345678901', 'bob@example.com'),
('Charlie Lee', 'S003', 'Other', 22, 'Mechanical', '3456789012', 'charlie@example.com');

INSERT INTO Doctors (name, specialization, contact_no, email)
VALUES 
('Dr. House', 'General Physician', '5551234567', 'house@example.com'),
('Dr. Watson', 'Surgeon', '5552345678', 'watson@example.com');

-- Appointments for Dr. House (trigger unavailable when 5 reached)
INSERT INTO Appointments (student_id, doctor_id, appointment_date, appointment_time, reason)
VALUES 
(1, 1, CURDATE(), '09:00:00', 'Fever'),
(2, 1, CURDATE(), '09:30:00', 'Headache'),
(3, 1, CURDATE(), '10:00:00', 'Stomach pain'),
(1, 1, CURDATE(), '10:30:00', 'Cough'),
(2, 1, CURDATE(), '11:00:00', 'Body ache');

-- Appointment for another doctor
INSERT INTO Appointments (student_id, doctor_id, appointment_date, appointment_time, reason)
VALUES 
(3, 2, CURDATE(), '11:30:00', 'Injury');

INSERT INTO HealthRecords (student_id, doctor_id, diagnosis, treatment, date_of_visit)
VALUES 
(1, 1, 'Common cold', 'Rest and hydration', CURDATE()),
(2, 1, 'Migraine', 'Painkillers', CURDATE());

INSERT INTO EmergencyAlerts (student_id, description)
VALUES (3, 'Fainted in class');

INSERT INTO BroadcastMessages (message)
VALUES ('Health center will be closed tomorrow for maintenance.');

-- Missed appointment (Bob, 2 days ago, no health record)
INSERT INTO Appointments (student_id, doctor_id, appointment_date, appointment_time, reason)
VALUES (2, 2, CURDATE() - INTERVAL 2 DAY, '14:00:00', 'Follow-up');

-- Try to double-book Alice on same date/time as earlier
INSERT INTO Appointments (student_id, doctor_id, appointment_date, appointment_time, reason)
VALUES (1, 2, CURDATE(), '09:00:00', 'Check-up'); -- Fails due to existing one

-- View output
SELECT * FROM vw_student_health_summary;
SELECT * FROM vw_student_health_analytics;
SELECT * FROM vw_doctor_daily_workload;
SELECT * FROM vw_missed_appointments;
SELECT * FROM Notifications;
SELECT * FROM audit_log;
