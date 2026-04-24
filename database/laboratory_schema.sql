-- Laboratory System Schema for Pharmacy Management System

-- Lab Technicians Table
CREATE TABLE lab_technicians (
    technician_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    phone_number VARCHAR(15),
    email VARCHAR(100),
    pharmacy_id INT REFERENCES Pharmacies(pharmacy_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab Tests Catalog Table
CREATE TABLE lab_tests (
    test_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    turnaround_days INT NOT NULL DEFAULT 1,
    sample_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab Orders Table
CREATE TABLE lab_orders (
    order_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES Patients(patient_id),
    technician_id INT REFERENCES lab_technicians(technician_id),
    ordered_by VARCHAR(150),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    CONSTRAINT chk_order_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Lab Order Items (which tests are included in an order)
CREATE TABLE lab_order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES lab_orders(order_id) ON DELETE CASCADE,
    test_id INT NOT NULL REFERENCES lab_tests(test_id),
    quantity INT NOT NULL DEFAULT 1
);

-- Lab Results Table
CREATE TABLE lab_results (
    result_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES lab_orders(order_id) ON DELETE CASCADE,
    test_id INT NOT NULL REFERENCES lab_tests(test_id),
    technician_id INT REFERENCES lab_technicians(technician_id),
    result_value TEXT NOT NULL,
    reference_range VARCHAR(100),
    is_abnormal BOOLEAN DEFAULT FALSE,
    result_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Indexes for faster queries
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_results_order ON lab_results(order_id);
CREATE INDEX idx_lab_order_items_order ON lab_order_items(order_id);
