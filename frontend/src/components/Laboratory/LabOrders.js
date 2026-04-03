import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function LabOrders() {
    const [orders, setOrders] = useState([]);
    const [tests, setTests] = useState([]);
    const [form, setForm] = useState({ patient_id: '', technician_id: '', ordered_by: '', notes: '', items: [] });
    const [selectedTests, setSelectedTests] = useState([]);
    const [error, setError] = useState('');

    const fetchOrders = () => {
        axios.get(`${API}/laboratory/orders`)
            .then(res => setOrders(res.data))
            .catch(() => setError('Failed to load lab orders'));
    };

    useEffect(() => {
        fetchOrders();
        axios.get(`${API}/laboratory/tests`)
            .then(res => setTests(res.data))
            .catch(() => setError('Failed to load tests'));
    }, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleTestToggle = testId => {
        setSelectedTests(prev =>
            prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
        );
    };

    const handleSubmit = e => {
        e.preventDefault();
        const payload = {
            ...form,
            items: selectedTests.map(test_id => ({ test_id, quantity: 1 }))
        };
        axios.post(`${API}/laboratory/orders`, payload)
            .then(() => {
                fetchOrders();
                setForm({ patient_id: '', technician_id: '', ordered_by: '', notes: '', items: [] });
                setSelectedTests([]);
            })
            .catch(() => setError('Failed to create lab order'));
    };

    const handleStatusChange = (orderId, status) => {
        axios.put(`${API}/laboratory/orders/${orderId}/status`, { status })
            .then(() => fetchOrders())
            .catch(() => setError('Failed to update order status'));
    };

    const handleCancel = orderId => {
        axios.delete(`${API}/laboratory/orders/${orderId}`)
            .then(() => fetchOrders())
            .catch(() => setError('Failed to cancel order'));
    };

    return (
        <div>
            <h2>Lab Orders</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="patient_id" placeholder="Patient ID" type="number" value={form.patient_id} onChange={handleChange} required />
                <input name="technician_id" placeholder="Technician ID (optional)" type="number" value={form.technician_id} onChange={handleChange} />
                <input name="ordered_by" placeholder="Ordered By" value={form.ordered_by} onChange={handleChange} />
                <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
                <fieldset>
                    <legend>Select Tests</legend>
                    {tests.map(t => (
                        <label key={t.test_id} style={{ display: 'block' }}>
                            <input
                                type="checkbox"
                                checked={selectedTests.includes(t.test_id)}
                                onChange={() => handleTestToggle(t.test_id)}
                            />
                            {t.name} — ${t.price} ({t.turnaround_days}d)
                        </label>
                    ))}
                </fieldset>
                <button type="submit">Create Order</button>
            </form>
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Patient</th>
                        <th>Ordered By</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.order_id}>
                            <td>{o.order_id}</td>
                            <td>{o.patient_first} {o.patient_last}</td>
                            <td>{o.ordered_by}</td>
                            <td>{new Date(o.order_date).toLocaleDateString()}</td>
                            <td>{o.status}</td>
                            <td>
                                {o.status === 'pending' && (
                                    <button onClick={() => handleStatusChange(o.order_id, 'in_progress')}>Start</button>
                                )}
                                {o.status === 'in_progress' && (
                                    <button onClick={() => handleStatusChange(o.order_id, 'completed')}>Complete</button>
                                )}
                                {o.status !== 'cancelled' && o.status !== 'completed' && (
                                    <button onClick={() => handleCancel(o.order_id)}>Cancel</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LabOrders;
