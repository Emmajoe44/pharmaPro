# PharmaPro Pharmacy Management System

## Overview
PharmaPro is a comprehensive pharmacy management system designed to streamline the operations of pharmacies. This system provides features to manage inventory, customer data, transactions, and reports to ensure efficient and effective pharmacy operations.

## Features
- **Inventory Management**: Track stock levels, manage suppliers, and set reorder points.
- **Prescription Management**: Efficiently manage prescriptions and medication doses for patients.
- **Customer Management**: Keep detailed records of customer information and transaction history.
- **Transactions**: Process sales and returns with integrated payment methods.
- **Reports**: Generate insightful reports on sales, inventory levels, and customer behavior.
- **Laboratory System**: Manage lab tests catalog, patient lab orders, and record test results.

## Laboratory System

The laboratory module exposes the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/laboratory/tests` | List all available lab tests |
| GET | `/api/laboratory/tests/:id` | Get a specific lab test |
| POST | `/api/laboratory/tests` | Create a new lab test type |
| PUT | `/api/laboratory/tests/:id` | Update a lab test |
| DELETE | `/api/laboratory/tests/:id` | Delete a lab test |
| GET | `/api/laboratory/orders` | List all lab orders |
| GET | `/api/laboratory/orders/:id` | Get a specific lab order |
| POST | `/api/laboratory/orders` | Place a new lab order for a patient |
| PUT | `/api/laboratory/orders/:id` | Update order status/priority |
| DELETE | `/api/laboratory/orders/:id` | Cancel/delete a lab order |
| GET | `/api/laboratory/results` | List all lab results |
| GET | `/api/laboratory/results/:id` | Get a specific lab result |
| POST | `/api/laboratory/results` | Record a result (auto-completes the order) |
| PUT | `/api/laboratory/results/:id` | Update a lab result |
| DELETE | `/api/laboratory/results/:id` | Delete a lab result |

### Database Tables

- **Lab_Tests** – Catalog of test types (name, description, price, normal range, unit).
- **Lab_Orders** – Orders placed by clinicians for patients; tracks priority (`normal`, `urgent`, `stat`) and status (`pending`, `in_progress`, `completed`, `cancelled`).
- **Lab_Results** – Results recorded by lab technicians; includes result value, notes, and interpretation status (`normal`, `abnormal`, `critical`). Recording a result automatically marks the linked order as `completed`.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Emmajoe44/pharmaPro.git
   ```
2. Navigate to the project directory:
   ```bash
   cd pharmaPro
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start
   ```

## Usage
- Navigate the user-friendly interface to access different modules of the pharmacy management system.
- Ensure proper data entry for accurate inventory tracking and customer management.

## Contributing
Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Author
#### Emmajoe44
> Date: 2026-03-13 12:00:44 UTC
> This README file was created as part of documenting the PharmaPro project, to assist users and contributors in understanding and using the system.