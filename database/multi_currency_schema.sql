-- Multi-Currency Database Schema for Pharmacy Management System

-- Pharmacy Info Table
CREATE TABLE pharmacy_info (
    pharmacy_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50),
    email VARCHAR(100)
);

-- Currencies Table
CREATE TABLE currencies (
    currency_id INT PRIMARY KEY AUTO_INCREMENT,
    currency_code VARCHAR(10) NOT NULL UNIQUE,
    currency_name VARCHAR(50) NOT NULL
);

-- Exchange Rates Table
CREATE TABLE exchange_rates (
    exchange_rate_id INT PRIMARY KEY AUTO_INCREMENT,
    currency_from INT NOT NULL,
    currency_to INT NOT NULL,
    rate DECIMAL(10, 6) NOT NULL,
    valid_date DATE NOT NULL,
    FOREIGN KEY (currency_from) REFERENCES currencies(currency_id),
    FOREIGN KEY (currency_to) REFERENCES currencies(currency_id)
);

-- Medicines Table
CREATE TABLE medicines (
    medicine_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency_id INT NOT NULL,
    FOREIGN KEY (currency_id) REFERENCES currencies(currency_id)
);

-- Sales Table
CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    currency_id INT NOT NULL,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id),
    FOREIGN KEY (currency_id) REFERENCES currencies(currency_id)
);

-- Reporting Table
CREATE TABLE sales_report (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    report_date DATE NOT NULL,
    total_sales DECIMAL(10, 2) NOT NULL,
    currency_id INT NOT NULL,
    FOREIGN KEY (currency_id) REFERENCES currencies(currency_id)
);

-- Index creation for faster queries
CREATE INDEX idx_sales_currency ON sales(currency_id);
CREATE INDEX idx_medicines_currency ON medicines(currency_id);

-- Example data insertion statements (to be updated as needed)
-- INSERT INTO pharmacy_info (name, address, contact_number, email) VALUES ('Example Pharmacy', '123 Main St', '123-456-7890', 'contact@example.com');
-- INSERT INTO currencies (currency_code, currency_name) VALUES ('USD', 'US Dollar');
-- INSERT INTO medicines (name, description, price, currency_id) VALUES ('Aspirin', 'Pain reliever', 9.99, 1);
-- INSERT INTO sales (medicine_id, quantity, sale_date, currency_id) VALUES (1, 2, NOW(), 1);
-- INSERT INTO sales_report (report_date, total_sales, currency_id) VALUES (CURDATE(), 19.98, 1);