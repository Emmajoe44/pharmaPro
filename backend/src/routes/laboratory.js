'use strict';

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/database');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

router.use(apiLimiter);

// ─── Lab Technicians ─────────────────────────────────────────────────────────

// GET /laboratory/technicians
router.get('/technicians', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM lab_technicians ORDER BY last_name, first_name'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /laboratory/technicians/:id
router.get('/technicians/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM lab_technicians WHERE technician_id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Technician not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /laboratory/technicians
router.post('/technicians', async (req, res) => {
    const { first_name, last_name, specialization, phone_number, email, pharmacy_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO lab_technicians (first_name, last_name, specialization, phone_number, email, pharmacy_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [first_name, last_name, specialization, phone_number, email, pharmacy_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /laboratory/technicians/:id
router.put('/technicians/:id', async (req, res) => {
    const { first_name, last_name, specialization, phone_number, email, pharmacy_id } = req.body;
    try {
        const result = await pool.query(
            `UPDATE lab_technicians
             SET first_name=$1, last_name=$2, specialization=$3, phone_number=$4, email=$5, pharmacy_id=$6
             WHERE technician_id=$7 RETURNING *`,
            [first_name, last_name, specialization, phone_number, email, pharmacy_id, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Technician not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /laboratory/technicians/:id
router.delete('/technicians/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM lab_technicians WHERE technician_id = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Technician not found' });
        }
        res.json({ message: 'Technician deleted', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Lab Tests Catalog ────────────────────────────────────────────────────────

// GET /laboratory/tests
router.get('/tests', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM lab_tests WHERE is_active = TRUE ORDER BY name'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /laboratory/tests/:id
router.get('/tests/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM lab_tests WHERE test_id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab test not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /laboratory/tests
router.post('/tests', async (req, res) => {
    const { name, description, price, turnaround_days, sample_type } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO lab_tests (name, description, price, turnaround_days, sample_type)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, description, price, turnaround_days || 1, sample_type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /laboratory/tests/:id
router.put('/tests/:id', async (req, res) => {
    const { name, description, price, turnaround_days, sample_type, is_active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE lab_tests
             SET name=$1, description=$2, price=$3, turnaround_days=$4, sample_type=$5, is_active=$6
             WHERE test_id=$7 RETURNING *`,
            [name, description, price, turnaround_days, sample_type, is_active, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab test not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /laboratory/tests/:id  (soft delete)
router.delete('/tests/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE lab_tests SET is_active = FALSE WHERE test_id = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab test not found' });
        }
        res.json({ message: 'Lab test deactivated', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Lab Orders ───────────────────────────────────────────────────────────────

// GET /laboratory/orders
router.get('/orders', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, p.first_name AS patient_first, p.last_name AS patient_last,
                    t.first_name AS tech_first, t.last_name AS tech_last
             FROM lab_orders o
             JOIN Patients p ON o.patient_id = p.patient_id
             LEFT JOIN lab_technicians t ON o.technician_id = t.technician_id
             ORDER BY o.order_date DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /laboratory/orders/:id  (includes items)
router.get('/orders/:id', async (req, res) => {
    try {
        const orderResult = await pool.query(
            `SELECT o.*, p.first_name AS patient_first, p.last_name AS patient_last,
                    t.first_name AS tech_first, t.last_name AS tech_last
             FROM lab_orders o
             JOIN Patients p ON o.patient_id = p.patient_id
             LEFT JOIN lab_technicians t ON o.technician_id = t.technician_id
             WHERE o.order_id = $1`,
            [req.params.id]
        );
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Lab order not found' });
        }

        const itemsResult = await pool.query(
            `SELECT oi.*, lt.name AS test_name, lt.price, lt.sample_type
             FROM lab_order_items oi
             JOIN lab_tests lt ON oi.test_id = lt.test_id
             WHERE oi.order_id = $1`,
            [req.params.id]
        );

        res.json({ ...orderResult.rows[0], items: itemsResult.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /laboratory/orders  (creates order + items in a transaction)
router.post('/orders', async (req, res) => {
    const { patient_id, technician_id, ordered_by, notes, items } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const orderResult = await client.query(
            `INSERT INTO lab_orders (patient_id, technician_id, ordered_by, notes)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [patient_id, technician_id, ordered_by, notes]
        );
        const order = orderResult.rows[0];

        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                await client.query(
                    `INSERT INTO lab_order_items (order_id, test_id, quantity) VALUES ($1, $2, $3)`,
                    [order.order_id, item.test_id, item.quantity || 1]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json(order);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /laboratory/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    try {
        const result = await pool.query(
            'UPDATE lab_orders SET status=$1 WHERE order_id=$2 RETURNING *',
            [status, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /laboratory/orders/:id
router.delete('/orders/:id', async (req, res) => {
    try {
        const result = await pool.query(
            "UPDATE lab_orders SET status='cancelled' WHERE order_id=$1 RETURNING *",
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab order not found' });
        }
        res.json({ message: 'Lab order cancelled', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Lab Results ──────────────────────────────────────────────────────────────

// GET /laboratory/results
router.get('/results', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, lt.name AS test_name,
                    p.first_name AS patient_first, p.last_name AS patient_last,
                    t.first_name AS tech_first, t.last_name AS tech_last
             FROM lab_results r
             JOIN lab_tests lt ON r.test_id = lt.test_id
             JOIN lab_orders o ON r.order_id = o.order_id
             JOIN Patients p ON o.patient_id = p.patient_id
             LEFT JOIN lab_technicians t ON r.technician_id = t.technician_id
             ORDER BY r.result_date DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /laboratory/results/:id
router.get('/results/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, lt.name AS test_name,
                    p.first_name AS patient_first, p.last_name AS patient_last,
                    t.first_name AS tech_first, t.last_name AS tech_last
             FROM lab_results r
             JOIN lab_tests lt ON r.test_id = lt.test_id
             JOIN lab_orders o ON r.order_id = o.order_id
             JOIN Patients p ON o.patient_id = p.patient_id
             LEFT JOIN lab_technicians t ON r.technician_id = t.technician_id
             WHERE r.result_id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab result not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /laboratory/results/order/:orderId  (all results for a given order)
router.get('/results/order/:orderId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, lt.name AS test_name,
                    t.first_name AS tech_first, t.last_name AS tech_last
             FROM lab_results r
             JOIN lab_tests lt ON r.test_id = lt.test_id
             LEFT JOIN lab_technicians t ON r.technician_id = t.technician_id
             WHERE r.order_id = $1
             ORDER BY r.result_date`,
            [req.params.orderId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /laboratory/results
router.post('/results', async (req, res) => {
    const { order_id, test_id, technician_id, result_value, reference_range, is_abnormal, notes } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const resultRow = await client.query(
            `INSERT INTO lab_results (order_id, test_id, technician_id, result_value, reference_range, is_abnormal, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [order_id, test_id, technician_id, result_value, reference_range, is_abnormal || false, notes]
        );

        // Mark order as completed if all tests have results
        await client.query(
            `UPDATE lab_orders SET status='completed'
             WHERE order_id=$1
               AND NOT EXISTS (
                   SELECT 1 FROM lab_order_items oi
                   WHERE oi.order_id=$1
                     AND NOT EXISTS (
                         SELECT 1 FROM lab_results r
                         WHERE r.order_id=$1 AND r.test_id=oi.test_id
                     )
               )`,
            [order_id]
        );

        await client.query('COMMIT');
        res.status(201).json(resultRow.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// PUT /laboratory/results/:id
router.put('/results/:id', async (req, res) => {
    const { result_value, reference_range, is_abnormal, notes } = req.body;
    try {
        const result = await pool.query(
            `UPDATE lab_results
             SET result_value=$1, reference_range=$2, is_abnormal=$3, notes=$4
             WHERE result_id=$5 RETURNING *`,
            [result_value, reference_range, is_abnormal, notes, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab result not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /laboratory/results/:id
router.delete('/results/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM lab_results WHERE result_id=$1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab result not found' });
        }
        res.json({ message: 'Lab result deleted', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
