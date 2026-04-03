'use strict';

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/database');

const labRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

router.use(labRateLimit);

// ─── Lab Tests ───────────────────────────────────────────────────────────────

// GET all lab tests
router.get('/tests', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Lab_Tests ORDER BY test_id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single lab test by ID
router.get('/tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM Lab_Tests WHERE test_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab test not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new lab test
router.post('/tests', async (req, res) => {
    try {
        const { name, description, price, normal_range, unit } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'name is required' });
        }
        const result = await pool.query(
            `INSERT INTO Lab_Tests (name, description, price, normal_range, unit)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, description || null, price || 0, normal_range || null, unit || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update a lab test
router.put('/tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, normal_range, unit } = req.body;
        const result = await pool.query(
            `UPDATE Lab_Tests
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 price = COALESCE($3, price),
                 normal_range = COALESCE($4, normal_range),
                 unit = COALESCE($5, unit)
             WHERE test_id = $6
             RETURNING *`,
            [name, description, price, normal_range, unit, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab test not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a lab test
router.delete('/tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM Lab_Tests WHERE test_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab test not found' });
        }
        res.json({ message: 'Lab test deleted', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Lab Orders ──────────────────────────────────────────────────────────────

// GET all lab orders (with patient and test info)
router.get('/orders', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT lo.*,
                    p.first_name || ' ' || p.last_name AS patient_name,
                    lt.name AS test_name
             FROM Lab_Orders lo
             LEFT JOIN Patients p ON lo.patient_id = p.patient_id
             LEFT JOIN Lab_Tests lt ON lo.test_id = lt.test_id
             ORDER BY lo.ordered_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single lab order by ID
router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT lo.*,
                    p.first_name || ' ' || p.last_name AS patient_name,
                    lt.name AS test_name
             FROM Lab_Orders lo
             LEFT JOIN Patients p ON lo.patient_id = p.patient_id
             LEFT JOIN Lab_Tests lt ON lo.test_id = lt.test_id
             WHERE lo.order_id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new lab order
router.post('/orders', async (req, res) => {
    try {
        const { patient_id, test_id, ordered_by, priority, notes } = req.body;
        if (!patient_id || !test_id) {
            return res.status(400).json({ error: 'patient_id and test_id are required' });
        }
        const result = await pool.query(
            `INSERT INTO Lab_Orders (patient_id, test_id, ordered_by, priority, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [patient_id, test_id, ordered_by || null, priority || 'normal', notes || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update a lab order (e.g., change status)
router.put('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ordered_by, priority, status, notes } = req.body;
        const result = await pool.query(
            `UPDATE Lab_Orders
             SET ordered_by = COALESCE($1, ordered_by),
                 priority   = COALESCE($2, priority),
                 status     = COALESCE($3, status),
                 notes      = COALESCE($4, notes)
             WHERE order_id = $5
             RETURNING *`,
            [ordered_by, priority, status, notes, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a lab order
router.delete('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM Lab_Orders WHERE order_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab order not found' });
        }
        res.json({ message: 'Lab order deleted', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Lab Results ─────────────────────────────────────────────────────────────

// GET all lab results
router.get('/results', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT lr.*,
                    lo.patient_id,
                    p.first_name || ' ' || p.last_name AS patient_name,
                    lt.name AS test_name,
                    lt.normal_range,
                    lt.unit
             FROM Lab_Results lr
             LEFT JOIN Lab_Orders lo ON lr.order_id = lo.order_id
             LEFT JOIN Patients p ON lo.patient_id = p.patient_id
             LEFT JOIN Lab_Tests lt ON lo.test_id = lt.test_id
             ORDER BY lr.conducted_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single lab result by ID
router.get('/results/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT lr.*,
                    lo.patient_id,
                    p.first_name || ' ' || p.last_name AS patient_name,
                    lt.name AS test_name,
                    lt.normal_range,
                    lt.unit
             FROM Lab_Results lr
             LEFT JOIN Lab_Orders lo ON lr.order_id = lo.order_id
             LEFT JOIN Patients p ON lo.patient_id = p.patient_id
             LEFT JOIN Lab_Tests lt ON lo.test_id = lt.test_id
             WHERE lr.result_id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab result not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a lab result and mark the order as completed
router.post('/results', async (req, res) => {
    const { order_id, technician_name, result_value, result_notes, status } = req.body;
    if (!order_id || !result_value) {
        return res.status(400).json({ error: 'order_id and result_value are required' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`SET LOCAL lock_timeout = '5s'`);

        // Lock the order row to prevent race conditions and validate its state
        const orderCheck = await client.query(
            `SELECT order_id, status FROM Lab_Orders WHERE order_id = $1 FOR UPDATE`,
            [order_id]
        );
        if (orderCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Lab order not found' });
        }
        if (orderCheck.rows[0].status === 'cancelled') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot record a result for a cancelled order' });
        }
        if (orderCheck.rows[0].status === 'completed') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'A result has already been recorded for this order' });
        }

        const resultRow = await client.query(
            `INSERT INTO Lab_Results (order_id, technician_name, result_value, result_notes, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [order_id, technician_name || null, result_value, result_notes || null, status || 'normal']
        );

        // Mark the associated order as completed
        await client.query(
            `UPDATE Lab_Orders SET status = 'completed' WHERE order_id = $1`,
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

// PUT update a lab result
router.put('/results/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { technician_name, result_value, result_notes, status } = req.body;
        const result = await pool.query(
            `UPDATE Lab_Results
             SET technician_name = COALESCE($1, technician_name),
                 result_value    = COALESCE($2, result_value),
                 result_notes    = COALESCE($3, result_notes),
                 status          = COALESCE($4, status)
             WHERE result_id = $5
             RETURNING *`,
            [technician_name, result_value, result_notes, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab result not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a lab result
router.delete('/results/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM Lab_Results WHERE result_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lab result not found' });
        }
        res.json({ message: 'Lab result deleted', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
