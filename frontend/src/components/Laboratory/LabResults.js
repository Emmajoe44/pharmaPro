import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function LabResults() {
    const [results, setResults] = useState([]);
    const [form, setForm] = useState({ order_id: '', test_id: '', technician_id: '', result_value: '', reference_range: '', is_abnormal: false, notes: '' });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');

    const fetchResults = () => {
        axios.get(`${API}/laboratory/results`)
            .then(res => setResults(res.data))
            .catch(() => setError('Failed to load lab results'));
    };

    useEffect(() => { fetchResults(); }, []);

    const handleChange = e => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = e => {
        e.preventDefault();
        const request = editId
            ? axios.put(`${API}/laboratory/results/${editId}`, form)
            : axios.post(`${API}/laboratory/results`, form);
        request
            .then(() => {
                fetchResults();
                setForm({ order_id: '', test_id: '', technician_id: '', result_value: '', reference_range: '', is_abnormal: false, notes: '' });
                setEditId(null);
            })
            .catch(() => setError('Failed to save lab result'));
    };

    const handleEdit = result => {
        setEditId(result.result_id);
        setForm({
            order_id: result.order_id,
            test_id: result.test_id,
            technician_id: result.technician_id || '',
            result_value: result.result_value,
            reference_range: result.reference_range || '',
            is_abnormal: result.is_abnormal,
            notes: result.notes || ''
        });
    };

    const handleDelete = id => {
        axios.delete(`${API}/laboratory/results/${id}`)
            .then(() => fetchResults())
            .catch(() => setError('Failed to delete lab result'));
    };

    return (
        <div>
            <h2>Lab Results</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                {!editId && (
                    <>
                        <input name="order_id" placeholder="Order ID" type="number" value={form.order_id} onChange={handleChange} required />
                        <input name="test_id" placeholder="Test ID" type="number" value={form.test_id} onChange={handleChange} required />
                        <input name="technician_id" placeholder="Technician ID (optional)" type="number" value={form.technician_id} onChange={handleChange} />
                    </>
                )}
                <input name="result_value" placeholder="Result Value" value={form.result_value} onChange={handleChange} required />
                <input name="reference_range" placeholder="Reference Range (e.g. 70-100 mg/dL)" value={form.reference_range} onChange={handleChange} />
                <label>
                    <input name="is_abnormal" type="checkbox" checked={form.is_abnormal} onChange={handleChange} />
                    Abnormal Result
                </label>
                <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
                <button type="submit">{editId ? 'Update Result' : 'Add Result'}</button>
                {editId && (
                    <button type="button" onClick={() => {
                        setEditId(null);
                        setForm({ order_id: '', test_id: '', technician_id: '', result_value: '', reference_range: '', is_abnormal: false, notes: '' });
                    }}>Cancel</button>
                )}
            </form>
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Result ID</th>
                        <th>Patient</th>
                        <th>Test</th>
                        <th>Technician</th>
                        <th>Value</th>
                        <th>Reference Range</th>
                        <th>Abnormal</th>
                        <th>Date</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map(r => (
                        <tr key={r.result_id} style={{ backgroundColor: r.is_abnormal ? '#ffe0e0' : 'inherit' }}>
                            <td>{r.result_id}</td>
                            <td>{r.patient_first} {r.patient_last}</td>
                            <td>{r.test_name}</td>
                            <td>{r.tech_first ? `${r.tech_first} ${r.tech_last}` : '-'}</td>
                            <td>{r.result_value}</td>
                            <td>{r.reference_range || '-'}</td>
                            <td>{r.is_abnormal ? '⚠ Yes' : 'No'}</td>
                            <td>{new Date(r.result_date).toLocaleDateString()}</td>
                            <td>{r.notes || '-'}</td>
                            <td>
                                <button onClick={() => handleEdit(r)}>Edit</button>
                                <button onClick={() => handleDelete(r.result_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LabResults;
