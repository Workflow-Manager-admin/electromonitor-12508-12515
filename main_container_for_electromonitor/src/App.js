import React, { useState } from 'react';
import './App.css';

/**
 * ELECTROMONITOR MAIN CONTAINER (Role-based UI for EB Officers & Customers)
 */

/* --- Helper: Notification Banner --- */
function NotificationBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      background: 'var(--kavia-orange)',
      color: '#000000',
      padding: '16px',
      textAlign: 'center',
      position: 'fixed',
      top: '64px',
      left: 0,
      width: '100%',
      zIndex: 1000,
      borderBottom: '2px solid #bbbbbb'
    }}>
      <span>{message}</span>
      <button
        className="btn"
        onClick={onClose}
        style={{
          marginLeft: 24,
          background: '#f2f2f2',
          color: '#000000',
          border: '1px solid #232323'
        }}
      >
        Close
      </button>
    </div>
  );
}

// ----- Helper: Role Selector -----
function RoleSelector({ role, setRole }) {
  return (
    <div style={{ textAlign: 'center', margin: '64px 0 32px' }}>
      <span className="subtitle" style={{ marginRight: '24px' }}>Select Role:</span>
      <button
        className={'btn' + (role === 'officer' ? ' btn-large' : '')}
        style={{ marginRight: '16px' }}
        onClick={() => setRole('officer')}
      >
        EB Officer
      </button>
      <button
        className={'btn' + (role === 'customer' ? ' btn-large' : '')}
        onClick={() => setRole('customer')}
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
      {error && <div style={{ color: '#000000', marginTop: 12 }}>{error}</div>}
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
        background: '#262626'
      }}>
        <thead>
          <tr style={{
            background: '#383838',
            color: '#000000'
          }}>
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
              <strong>Payable Amount:</strong> <span style={{
                color: '#f2f2f2',
                fontWeight: 700,
                background: '#232323',
                padding: '2px 8px',
                borderRadius: 4
              }}>₹{usageRecord.payable}</span><br />
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
    // Welcome page, visually centered, modern, clean, and themed
    mainView = (
      <div style={{
        minHeight: '62vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '64px 0',
        background: 'transparent'
      }}>
        <div
          className="panel"
          style={{
            background: '#f5f5f5',
            maxWidth: 480,
            margin: 'auto',
            textAlign: 'center',
            borderRadius: 14,
            boxShadow: '0 2px 10px 0 rgba(100,100,100,0.10)',
            color: '#000000',
            border: '1px solid #e0e0e0'
          }}
        >
          <h1 className="title" style={{ color: '#000000', marginBottom: 6, letterSpacing: 0.5 }}>Welcome to ElectroMonitor</h1>
          <div className="subtitle" style={{ color: '#000000', fontWeight: 500 }}>Track & Manage Electricity Smartly</div>
          <p className="description" style={{
            margin: '12px 0 32px',
            fontSize: '1.2rem',
            color: '#353535'
          }}>
            Empowering <span style={{ color: '#000000', fontWeight: 600 }}>EB Officers</span> and <span style={{ color: '#000000', fontWeight: 600 }}>Consumers</span>.<br />
            Monitor usage, record chip data, and stay updated with your electricity bills — all with a clean, modern interface.
          </p>
          <RoleSelector role={role} setRole={setRole} />
          <img
            src="logo.svg"
            alt="ElectroMonitor Icon"
            style={{ width: 80, margin: '24px auto 0', filter: 'drop-shadow(0 2px 8px #bdbdbd88)', opacity: 0.96 }}
          />
        </div>
      </div>
    );
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
