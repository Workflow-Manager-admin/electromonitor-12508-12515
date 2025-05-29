import React, { useState } from 'react';
import './App.css';

/**
 * ELECTROMONITOR MAIN CONTAINER (Role-based UI for EB Officers & Customers)
 */

// ----- Helper: Notification Banner -----
function NotificationBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      background: 'var(--kavia-orange)',
      color: '#fff',
      padding: '16px',
      textAlign: 'center',
      position: 'fixed',
      top: '64px',
      left: 0,
      width: '100%',
      zIndex: 1000,
    }}>
      <span>{message}</span>
      <button
        className="btn"
        onClick={onClose}
        style={{
          marginLeft: 24,
          background: 'rgba(0,0,0,0.07)',
          color: '#fff',
          border: '1px solid #fff'
        }}
      >
        Close
      </button>
    </div>
  );
}

// ----- Helper: Role Selector (Landing page with custom accent/button/typography) -----
function RoleSelector({ role, setRole }) {
  return (
    <div className="cover-role-select" style={{ textAlign: 'center', margin: '0 0 32px' }}>
      <span className="cover-subtitle" style={{ marginRight: '28px' }}>Select Role:</span>
      <button
        className={'cover-btn' + (role === 'officer' ? ' btn-large' : '')}
        style={{ marginRight: '16px' }}
        onClick={() => setRole('officer')}
        type="button"
      >
        EB Officer
      </button>
      <button
        className={'cover-btn' + (role === 'customer' ? ' btn-large' : '')}
        onClick={() => setRole('customer')}
        type="button"
      >
        Customer
      </button>
    </div>
  );
}

// ----- Officer: Data Entry & Usage Table -----
function OfficerUsageEntry({ customers, addUsage }) {
  const [customerId, setCustomerId] = useState(customers.length > 0 ? customers[0].id : '');
  const [usage, setUsage] = useState('');
  const [chipId, setChipId] = useState('');
  const [error, setError] = useState('');

  // PUBLIC_INTERFACE
  function handleAddUsage(e) {
    e.preventDefault();
    const usageNum = parseFloat(usage);
    if (!customerId || isNaN(usageNum) || usageNum <= 0 || !chipId.trim()) {
      setError('All fields are required and usage must be a positive number.');
      return;
    }
    setError('');
    addUsage(customerId, usageNum, chipId);
    setUsage('');
    setChipId('');
  }

  return (
    <div style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 24 }}>
      <div className="subtitle" style={{ marginBottom: 12 }}>Usage Data Entry</div>
      <form style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }} onSubmit={handleAddUsage}>
        <div>
          <label>Customer:</label><br />
          <select className="btn" value={customerId} onChange={e => setCustomerId(e.target.value)}>
            {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div>
          <label>Usage (kWh):</label><br />
          <input
            type="number"
            value={usage}
            min="0"
            step="0.01"
            onChange={e => setUsage(e.target.value)}
            className="btn"
            style={{ width: 100 }}
            required
          />
        </div>
        <div>
          <label>Chip ID:</label><br />
          <input
            type="text"
            value={chipId}
            onChange={e => setChipId(e.target.value)}
            className="btn"
            style={{ width: 120, letterSpacing: 1 }}
            placeholder="e.g. CHIP1234"
            required
          />
        </div>
        <button className="btn" type="submit">Add Usage</button>
      </form>
      {error && <div style={{ color: '#e87a41', marginTop: 12 }}>{error}</div>}
    </div>
  );
}

// ----- Officer: Usage Table -----
function OfficerUsageTable({ usageRecords, customers }) {
  return (
    <div style={{overflowX: 'auto'}}>
      <div className="subtitle" style={{ margin: '16px 0 8px' }}>Current Usage Records</div>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: 12,
        fontSize: '1rem',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <thead>
          <tr style={{ background: 'var(--kavia-dark)', color: 'var(--kavia-orange)' }}>
            <th style={{ padding: 8, borderBottom: '1px solid var(--border-color)' }}>Customer</th>
            <th style={{ padding: 8, borderBottom: '1px solid var(--border-color)' }}>Chip ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid var(--border-color)' }}>Latest Usage (kWh)</th>
            <th style={{ padding: 8, borderBottom: '1px solid var(--border-color)' }}>Payable Amount (₹)</th>
            <th style={{ padding: 8, borderBottom: '1px solid var(--border-color)' }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => {
            const usage = usageRecords.find(u => u.customerId === customer.id);
            return (
              <tr key={customer.id}>
                <td style={{ padding: 8 }}>{customer.name}</td>
                <td style={{ padding: 8 }}>{usage ? usage.chipId : '-'}</td>
                <td style={{ padding: 8 }}>
                  {usage ? usage.usage : '-'}
                </td>
                <td style={{ padding: 8 }}>
                  {usage ? `₹${usage.payable}` : '-'}
                </td>
                <td style={{ padding: 8 }}>
                  {usage ? usage.updatedAt : '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}

// ----- Customer: Dashboard -----
function CustomerDashboard({ customer, usageRecord }) {
  return (
    <div className="hero" style={{ paddingTop: 48 }}>
      <div className="subtitle">Welcome, {customer.name}!</div>
      <h1 className="title" style={{ fontSize: '2.6rem' }}>Electricity Usage & Payment Summary</h1>
      <div className="description" style={{ marginBottom: 8 }}>
        {usageRecord
          ? (
            <>
              <strong>Latest Usage:</strong> {usageRecord.usage} kWh<br />
              <strong>Payable Amount:</strong> <span style={{ color: 'var(--kavia-orange)', fontWeight: 700 }}>₹{usageRecord.payable}</span><br />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.96em' }}>
                <strong>Last Updated:</strong> {usageRecord.updatedAt}
              </span>
            </>
          )
          : (
            <span>No usage data available yet. Please check back once your EB Officer enters the data.</span>
          )
        }
      </div>
    </div>
  );
}

// ----- Customer Selector for Testing -----
function CustomerSelector({ customers, customerId, setCustomerId }) {
  return (
    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <span className="subtitle" style={{ marginRight: 24 }}>Select Customer:</span>
      <select className="btn" value={customerId} onChange={e => setCustomerId(e.target.value)}>
        {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
      </select>
    </div>
  );
}

// ----- In-Memory Data -----
const initialCustomers = [
  { id: 'c1', name: 'Arun Kumar' },
  { id: 'c2', name: 'Sneha Bhat' },
  { id: 'c3', name: 'Ramya R.' },
];

// PUBLIC_INTERFACE
function calculatePayable(usage) {
  // Simple slab: 0-100 units: ₹3/unit, 101-300: ₹5/unit, >300: ₹7/unit
  if (usage <= 100) return usage * 3;
  if (usage <= 300) return (100 * 3) + ((usage-100) * 5);
  return (100 * 3) + (200 * 5) + ((usage-300) * 7);
}

// ----- MainContainer -----
function App() {
  // State: role, mock customer/usage, notification
  const [role, setRole] = useState('');
  const [customers] = useState(initialCustomers);
  const [usageRecords, setUsageRecords] = useState([]); // [{customerId, usage, payable, chipId, updatedAt}]
  const [notification, setNotification] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0].id);

  // Handler: Officer adds usage for a customer
  // PUBLIC_INTERFACE
  function addUsage(customerId, usage, chipId) {
    const payable = calculatePayable(usage);
    const now = new Date().toLocaleString('en-IN', { hour12: true });
    setUsageRecords(prev => {
      // Replace if exists, otherwise add new
      const updated = prev.filter(r => r.customerId !== customerId);
      updated.push({ customerId, usage, payable, chipId, updatedAt: now });
      return updated;
    });
    // Notification: Inform customer
    const customer = customers.find(c => c.id === customerId);
    setNotification(`Notification: ${customer.name} - New usage data entered. Payable Amount is ₹${payable}.`);
  }

  // Handler: Dismiss notification
  // PUBLIC_INTERFACE
  function handleCloseNotification() {
    setNotification('');
  }

  // Officer & Customer views
  let mainView = null;
  if (!role) {
    mainView = <RoleSelector role={role} setRole={setRole} />;
  } else if (role === 'officer') {
    mainView = (
      <div>
        <OfficerUsageEntry customers={customers} addUsage={addUsage} />
        <OfficerUsageTable usageRecords={usageRecords} customers={customers} />
      </div>
    );
  } else if (role === 'customer') {
    const customer = customers.find(c => c.id === selectedCustomerId);
    const usage = usageRecords.find(r => r.customerId === selectedCustomerId);
    mainView = (
      <>
        <CustomerSelector customers={customers} customerId={selectedCustomerId} setCustomerId={setSelectedCustomerId} />
        <CustomerDashboard customer={customer} usageRecord={usage} />
      </>
    );
  }

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> ElectroMonitor
              <span style={{
                fontWeight: 400,
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginLeft: '8px',
                letterSpacing: 1
              }}>
                (KAVIA)
              </span>
            </div>
            {role &&
              <button className="btn" onClick={() => setRole('')}>
                Switch Role
              </button>
            }
          </div>
        </div>
      </nav>
      <NotificationBanner message={notification} onClose={handleCloseNotification} />
      <main>
        <div className="container" style={{ paddingTop: 100, paddingBottom: 48 }}>
          {mainView}
        </div>
      </main>
    </div>
  );
}

export default App;
