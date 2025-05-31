import React, { useState } from 'react';
import './App.css';

// ----- Helper: Notification Banner -----
function NotificationBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="notification-banner" style={{
      position: 'fixed',
      top: '64px',
      left: 0,
      width: '100%',
      zIndex: 1000
    }}>
      <span>{message}</span>
      <button
        className="btn"
        onClick={onClose}
        style={{
          marginLeft: 24,
          background: 'var(--kavia-orange)',
          border: '1px solid #000',
          color: '#fff'
        }}
      >
        Close
      </button>
    </div>
  );
}

// ----- Helper: Role Selector -----
function RoleSelector({ setRole }) {
  return (
    <section className="hero" style={{
      minHeight: '70vh',
      justifyContent: 'center',
      borderRadius: 14
    }}>
      <div>
        <div className="subtitle" style={{ fontSize: '1.2rem', fontWeight: 500 }}>
          Welcome to ElectroMonitor
        </div>
        <h1 className="title" style={{ fontWeight: 700, fontSize: '2.45rem', marginBottom: 8 }}>
          Smarter Management for Power
        </h1>
        <div className="description">
          Monitor, input, and stay notified on your electricity usage.<br/>
          Please choose your role to proceed:
        </div>
        <div style={{ marginTop: 34 }}>
          <button className="btn btn-large" style={{
            border: '2px solid #919191',
            margin: '0 18px',
            fontWeight: 600
          }} onClick={() => setRole('officer')}>
            <span role="img" aria-label="Officer">🦺</span> EB Officer
          </button>
          <button className="btn btn-large" style={{
            border: '2px solid #000',
            fontWeight: 600
          }} onClick={() => setRole('customer')}>
            <span role="img" aria-label="Customer">💡</span> Customer
          </button>
        </div>
      </div>
    </section>
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
    <div className="panel">
      <div className="subtitle" style={{ marginBottom: 16, fontWeight: 600 }}>
        Welcome, EB Officer!
      </div>
      <h2 style={{
        fontWeight: 600,
        marginBottom: 8
      }}>
        Input Usage Data for Customers
      </h2>
      <form style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 10 }} onSubmit={handleAddUsage}>
        <div>
          <label style={{fontWeight: 500}}>Customer:</label><br />
          <select className="btn"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}>
            {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div>
          <label style={{fontWeight: 500}}>Usage (kWh):</label><br />
          <input
            type="number"
            value={usage}
            min="0"
            step="0.01"
            onChange={e => setUsage(e.target.value)}
            className="btn"
            style={{ width: 90 }}
            placeholder="e.g. 240"
            required
          />
        </div>
        <div>
          <label style={{fontWeight: 500}}>Chip ID:</label><br />
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
        <button className="btn" style={{
          background: 'var(--kavia-orange)',
          fontWeight: 600
        }} type="submit">Add Usage</button>
      </form>
      {error && <div style={{ color: '#919191', marginTop: 12 }}>{error}</div>}
    </div>
  );
}

// ----- Officer: Usage Table -----
function OfficerUsageTable({ usageRecords, customers }) {
  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <div className="subtitle" style={{ margin: '6px 0 12px' }}>
        Customer Usage Overview
      </div>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '1rem'
      }}>
        <thead>
          <tr>
            <th style={{ padding: 8, borderBottom: '1px solid #919191' }}>Customer</th>
            <th style={{ padding: 8, borderBottom: '1px solid #919191' }}>Chip ID</th>
            <th style={{ padding: 8, borderBottom: '1px solid #919191' }}>Latest Usage (kWh)</th>
            <th style={{ padding: 8, borderBottom: '1px solid #919191' }}>Payable Amount (₹)</th>
            <th style={{ padding: 8, borderBottom: '1px solid #919191' }}>Last Updated</th>
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
                <td style={{
                  padding: 8,
                  color: usage ? '#919191' : '#000',
                  fontWeight: usage ? 700 : 400
                }}>
                  {usage ? `₹${usage.payable}` : '-'}
                </td>
                <td style={{ padding: 8, fontSize: '0.93em', color: '#919191' }}>
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
    <div className="hero" style={{
      paddingTop: 36,
      minHeight: '58vh',
      borderRadius: 12
    }}>
      <div className="subtitle" style={{
        fontWeight: 600,
        fontSize: '1.19rem'
      }}>
        Hello, {customer.name}!
      </div>
      <h1 className="title" style={{ fontSize: '2.3rem', margin: 8 }}>
        Your Electricity Usage & Payment
      </h1>
      <div className="description" style={{
        minHeight: 55
      }}>
        {usageRecord
          ? (
            <>
              <strong>Latest Usage:</strong> <span>{usageRecord.usage} kWh</span><br />
              <strong>Payable Amount:</strong>{' '}
                <span style={{ color: '#e87a41', fontWeight: 700, fontSize: '1.09em' }}>₹{usageRecord.payable}</span><br />
              <span style={{ color: '#919191', fontSize: '0.97em' }}>
                <strong>Last Updated:</strong> {usageRecord.updatedAt}
              </span>
            </>
          )
          : (
            <span style={{ color: '#919191' }}>
              No usage data available yet. Please check back once your EB Officer enters the data.
            </span>
          )
        }
      </div>
      {usageRecord && (
        <div style={{
          marginTop: 24,
          background: '#919191',
          padding: '12px 24px',
          borderRadius: 7,
          color: '#fff',
          fontWeight: 500,
          letterSpacing: 0.2
        }}>
          Notice: A new usage entry was added by your EB Officer!
        </div>
      )}
    </div>
  );
}

// ----- Customer Selector (for simulated login) -----
function CustomerSelector({ customers, customerId, setCustomerId }) {
  return (
    <div className="panel" style={{
      margin: '32px 0 0',
      textAlign: 'center'
    }}>
      <span className="subtitle" style={{
        marginRight: 18,
        fontWeight: 500
      }}>Select Customer:</span>
      <select className="btn"
        value={customerId}
        style={{ fontWeight: 600 }}
        onChange={e => setCustomerId(e.target.value)}
        aria-label="select customer"
      >
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
/**
 * PUBLIC_INTERFACE
 * The main ElectroMonitor container providing role-based dashboards for EB officers and customers,
 * role selection (landing), and all UI per requirements.
 */
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
  let mainView;
  if (!role) {
    mainView = <RoleSelector setRole={setRole} />;
  } else if (role === 'officer') {
    mainView = (
      <div>
        <div className="panel" style={{
          background: 'linear-gradient(120deg, #caf0fe 0%, #e6f3fa 100%)',
          marginBottom: 30,
          fontFamily: "'Montserrat', 'Poppins', Arial, sans-serif",
          fontWeight: 500,
          color: '#1a1a1a'
        }}>
          <h1 style={{margin: 0, color: '#222'}}>EB Officer Dashboard</h1>
          <div className="description" style={{color: '#555'}}>
            You can view customer electricity records and enter chip-based usage data below.
          </div>
        </div>
        <OfficerUsageEntry customers={customers} addUsage={addUsage} />
        <OfficerUsageTable usageRecords={usageRecords} customers={customers} />
      </div>
    );
  } else if (role === 'customer') {
    const customer = customers.find(c => c.id === selectedCustomerId);
    const usage = usageRecords.find(r => r.customerId === selectedCustomerId);

    mainView = (
      <>
        <div className="panel" style={{
          background: 'linear-gradient(100deg, #caf0fe 0%, #e6f6fd 100%)',
          color: '#000',
          marginBottom: 28,
          fontFamily: "'Montserrat', 'Poppins', Arial, sans-serif",
        }}>
          <h1 style={{
            fontSize: '2.1rem',
            color: '#222'
          }}>
            Customer Dashboard
          </h1>
          <div className="description" style={{
            fontSize: '1.08em', color: '#555'
          }}>
            Check your electricity usage status, payables, and notifications.
          </div>
        </div>
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
              <span className="logo-symbol" style={{color: '#919191'}}>⚡</span> ElectroMonitor
              <span style={{
                fontWeight: 400,
                fontSize: '1rem',
                color: '#919191',
                marginLeft: '8px',
                letterSpacing: 1
              }}>
                (Power Monitor)
              </span>
            </div>
            {role &&
              <button className="btn"
                style={{
                  border: '1.5px solid #919191',
                  marginLeft: 12,
                  fontWeight: 700
                }}
                onClick={() => setRole('')}
              >
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
