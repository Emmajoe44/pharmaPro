-- Database schema for Pharmacy Management System

CREATE TABLE Patients (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10),
    phone_number VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE Prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES Patients(patient_id),
    prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE Medications (
    medication_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    quantity INT NOT NULL
);

CREATE TABLE Prescription_Items (
    prescription_item_id SERIAL PRIMARY KEY,
    prescription_id INT REFERENCES Prescriptions(prescription_id),
    medication_id INT REFERENCES Medications(medication_id),
    quantity INT NOT NULL
);

CREATE TABLE Pharmacies (
    pharmacy_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE Pharmacy_Staff (
    staff_id SERIAL PRIMARY KEY,
    pharmacy_id INT REFERENCES Pharmacies(pharmacy_id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    phone_number VARCHAR(15)
);

CREATE TABLE Inventory (
    inventory_id SERIAL PRIMARY KEY,
    medication_id INT REFERENCES Medications(medication_id),
    pharmacy_id INT REFERENCES Pharmacies(pharmacy_id),
    stock INT NOT NULL
);

-- Additional setup and relationships can be added as needed

-- Laboratory System Tables

CREATE TABLE Lab_Tests (
    test_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    normal_range VARCHAR(100),
    unit VARCHAR(50)
);

CREATE TABLE Lab_Orders (
    order_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES Patients(patient_id),
    test_id INT REFERENCES Lab_Tests(test_id),
    ordered_by VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'stat')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Lab_Results (
    result_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES Lab_Orders(order_id),
    technician_name VARCHAR(150),
    result_value VARCHAR(200),
    result_notes TEXT,
    status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'abnormal', 'critical')),
    conducted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
