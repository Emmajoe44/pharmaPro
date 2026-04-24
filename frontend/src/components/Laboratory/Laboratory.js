import React, { useState } from 'react';
import LabTests from './LabTests';
import LabOrders from './LabOrders';
import LabResults from './LabResults';

const TABS = [
    { key: 'tests', label: 'Tests Catalog' },
    { key: 'orders', label: 'Orders' },
    { key: 'results', label: 'Results' },
];

function Laboratory() {
    const [activeTab, setActiveTab] = useState('tests');

    return (
        <div>
            <h1>Laboratory System</h1>
            <nav>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{ fontWeight: activeTab === tab.key ? 'bold' : 'normal', marginRight: 8 }}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <hr />
            {activeTab === 'tests' && <LabTests />}
            {activeTab === 'orders' && <LabOrders />}
            {activeTab === 'results' && <LabResults />}
        </div>
    );
}

export default Laboratory;
