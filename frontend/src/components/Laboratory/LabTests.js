import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function LabTests() {
    const [tests, setTests] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', price: '', turnaround_days: 1, sample_type: '' });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');

    const fetchTests = () => {
        axios.get(`${API}/laboratory/tests`)
            .then(res => setTests(res.data))
            .catch(() => setError('Failed to load lab tests'));
    };

    useEffect(() => { fetchTests(); }, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        const request = editId
            ? axios.put(`${API}/laboratory/tests/${editId}`, form)
            : axios.post(`${API}/laboratory/tests`, form);
        request
            .then(() => { fetchTests(); setForm({ name: '', description: '', price: '', turnaround_days: 1, sample_type: '' }); setEditId(null); })
            .catch(() => setError('Failed to save lab test'));
    };

    const handleEdit = test => {
        setEditId(test.test_id);
        setForm({ name: test.name, description: test.description || '', price: test.price, turnaround_days: test.turnaround_days, sample_type: test.sample_type || '' });
    };

    const handleDeactivate = id => {
        axios.delete(`${API}/laboratory/tests/${id}`)
            .then(() => fetchTests())
            .catch(() => setError('Failed to deactivate lab test'));
    };

    return (
        <div>
            <h2>Lab Tests Catalog</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Test Name" value={form.name} onChange={handleChange} required />
                <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
                <input name="price" placeholder="Price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
                <input name="turnaround_days" placeholder="Turnaround Days" type="number" value={form.turnaround_days} onChange={handleChange} required />
                <input name="sample_type" placeholder="Sample Type (e.g. blood)" value={form.sample_type} onChange={handleChange} />
                <button type="submit">{editId ? 'Update Test' : 'Add Test'}</button>
                {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '', price: '', turnaround_days: 1, sample_type: '' }); }}>Cancel</button>}
            </form>
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Turnaround (days)</th>
                        <th>Sample Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tests.map(t => (
                        <tr key={t.test_id}>
                            <td>{t.name}</td>
                            <td>{t.description}</td>
                            <td>{t.price}</td>
                            <td>{t.turnaround_days}</td>
                            <td>{t.sample_type}</td>
                            <td>
                                <button onClick={() => handleEdit(t)}>Edit</button>
                                <button onClick={() => handleDeactivate(t.test_id)}>Deactivate</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LabTests;
