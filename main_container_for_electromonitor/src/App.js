import React, { useState, useEffect, useRef } from 'react';
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

/**
 * Officer Login Form: id, name, password; onSuccess triggers callback with login values.
 */
function OfficerLoginForm({ onLogin, errorMsg }) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [pwd, setPwd] = useState('');
  // PUBLIC_INTERFACE
  function handleLogin(e) {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !pwd.trim()) return onLogin(null, "All fields are required.");
    // In prod: add real validation. For now, accept any non-empty.
    onLogin({ id, name, pwd }, "");
  }
  return (
    <form className="login-form panel" onSubmit={handleLogin} style={{ maxWidth: 380, margin: '0 auto', marginTop: 50 }}>
      <div className="login-title subtitle" style={{ fontWeight: 800, fontSize: '1.6em', textAlign: "center" }}>EB Officer Login</div>
      <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
        <div>
          <label style={{ fontWeight: 600 }}>Officer ID:</label><br />
          <input value={id} onChange={e => setId(e.target.value)} placeholder="Enter ID" required autoFocus />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Name:</label><br />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter Name" required />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Password:</label><br />
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="Password" />
        </div>
        <button className="btn btn-large" style={{ marginTop: 14, fontWeight: 700 }}>Login</button>
      </div>
      {errorMsg && <div style={{ marginTop: 15, color: '#800000', fontWeight: 700 }}>{errorMsg}</div>}
    </form>
  );
}
/**
 * Customer Login Form: phone, name, password.
 */
function CustomerLoginForm({ onLogin, errorMsg }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pwd, setPwd] = useState('');
  // PUBLIC_INTERFACE
  function handleLogin(e) {
    e.preventDefault();
    if (!phone.trim() || !name.trim() || !pwd.trim()) return onLogin(null, "All fields are required.");
    if (!/^[0-9]{10}$/.test(phone)) return onLogin(null, "Phone number must be exactly 10 digits.");
    onLogin({ phone, name, pwd }, "");
  }
  return (
    <form className="login-form panel" onSubmit={handleLogin} style={{ maxWidth: 380, margin: '0 auto', marginTop: 50 }}>
      <div className="login-title subtitle" style={{ fontWeight: 800, fontSize: '1.6em', textAlign: "center" }}>Customer Login</div>
      <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
        <div>
          <label style={{ fontWeight: 600 }}>Phone Number:</label><br />
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/,''))} maxLength={10} minLength={10} inputMode="numeric" required placeholder="10 digits" />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Name:</label><br />
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="Enter Name" />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Password:</label><br />
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="Password" />
        </div>
        <button className="btn btn-large" style={{ marginTop: 14, fontWeight: 700 }}>Login</button>
      </div>
      {errorMsg && <div style={{ marginTop: 15, color: '#800000', fontWeight: 700 }}>{errorMsg}</div>}
    </form>
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
        <div className="welcome-message">
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
            fontWeight: 600,
            color: '#fff'
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

/*
 * OfficerUsageEntry - With strict ChipID, Usage validation.
 * Displays any error in a pop-up not just inline.
 * Chip ID: alphanumeric (max 8 chars), Usage: numeric (>0)
 */
function OfficerUsageEntry({ customers, addUsage }) {
  const [customerId, setCustomerId] = useState(customers.length > 0 ? customers[0].id : '');
  const [usage, setUsage] = useState('');
  const [chipId, setChipId] = useState('');
  const [error, setError] = useState('');
  const [popup, setPopup] = useState('');

  // PUBLIC_INTERFACE
  function handleAddUsage(e) {
    e.preventDefault();
    // Validation
    const usageNum = parseFloat(usage);
    if (!customerId || !usage || !chipId.trim()) {
      setPopup('All fields are required.');
      return;
    }
    if (isNaN(usageNum) || usageNum <= 0) {
      setPopup('Usage must be a positive number.');
      return;
    }
    if (!/^[a-z0-9]+$/i.test(chipId)) {
      setPopup('Chip ID must be alphanumeric only.');
      return;
    }
    if (chipId.length > 8) {
      setPopup('Chip ID must be at most 8 characters.');
      return;
    }
    setError('');
    setPopup('');
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
          fontWeight: 600,
          color: '#fff'
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

/**
 * PUBLIC_INTERFACE
 * Enhanced CustomerPaymentSection: UI for payment method/status and payment logic.
 * Lets user choose payment method: 
 *  - Select Online/Offline (radio or select)
 *  - If Online, select detailed method
 * Handles "Mark Paid" operation flows. Only marks as paid after confirmed (online/offline). 
 */
function CustomerPaymentSection({
  usageRecord,
  onMarkPaid,
  paymentState,
  setPaymentState
}) {
  // Move all hooks to top level (fixing rules of hooks)
  const [showConfirm, setShowConfirm] = useState(false);

  const payment_methods = {
    Online: [
      { label: 'PhonePe', value: 'phonepe' },
      { label: 'Pay', value: 'pay' },
      { label: 'Card (debit)', value: 'card_debit' },
      { label: 'Card (credit)', value: 'card_credit' }
    ],
    Offline: []
  };

  // Default payment mode if not set
  useEffect(() => {
    if (!paymentState.mode) {
      setPaymentState(ps => ({ ...ps, mode: 'Offline', method: '' }));
    }
    // eslint-disable-next-line
  }, []);

  if (!usageRecord || usageRecord.paymentStatus === "paid") return null;

  // paymentState example: { mode: "Online"|"Offline", method: "phonepe"|"pay"|... }
  // For control outside (send state up so parent preserves on re-render)
  function handleModeChange(e) {
    const newValue = e.target.value;
    setPaymentState(ps => ({
      ...ps,
      mode: newValue,
      // reset method if switching to Offline
      method: newValue === 'Online' ? (ps.method || 'phonepe') : ''
    }));
  }

  function handleMethodChange(e) {
    setPaymentState(ps => ({
      ...ps,
      method: e.target.value
    }));
  }

  // Handler: confirm payment (shows confirm UI if online, otherwise marks paid)
  function handlePayClick() {
    if (paymentState.mode === 'Online') {
      setShowConfirm(true);
    } else {
      onMarkPaid("offline");
    }
  }
  // Handler: Complete simulated online payment
  function handleConfirmOnline() {
    setShowConfirm(false);
    onMarkPaid(paymentState.method || "online");
  }
  function handleCancelOnline() {
    setShowConfirm(false);
  }

  return (
    <div className="panel" style={{
      marginTop: 18,
      marginBottom: 10,
      background: '#f7fbff',
      border: '2.5px solid #919191',
      borderRadius: 10,
      fontWeight: 500,
      fontSize: "1.05em"
    }}>
      <div style={{ fontWeight: 700, fontSize: "1.2em", marginBottom: 7 }}>
        Choose Payment Option
      </div>
      <form style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
        <label style={{ marginRight: 10, fontWeight: 500 }}>
          <input
            type="radio"
            name="pay_mode"
            value="Online"
            checked={paymentState.mode === "Online"}
            onChange={handleModeChange}
            style={{ marginRight: 6 }}
          />
          Online
        </label>
        <label style={{ marginRight: 18, fontWeight: 500 }}>
          <input
            type="radio"
            name="pay_mode"
            value="Offline"
            checked={paymentState.mode === "Offline"}
            onChange={handleModeChange}
            style={{ marginRight: 6 }}
          />
          Offline
        </label>
        {paymentState.mode === "Online" && (
          <select
            className="btn"
            style={{ marginLeft: 10, minWidth: 150 }}
            value={paymentState.method || "phonepe"}
            onChange={handleMethodChange}
            aria-label="Select online payment method"
          >
            {payment_methods.Online.map(opt => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </form>
      <div style={{ marginTop: 28, textAlign: "right" }}>
        <button
          className="btn btn-large"
          style={{
            background: paymentState.mode === "Online" ? "#caf0fe" : "#12C984",
            color: paymentState.mode === "Online" ? "#222" : "#fff",
            fontWeight: 700,
            border: "2px solid #919191"
          }}
          type="button"
          onClick={handlePayClick}
        >
          {paymentState.mode === "Online" ? "Pay & Confirm Online" : "Mark as Paid (Offline)"}
        </button>
      </div>
      {/* Simulated Confirmation Dialog for Online */}
      {showConfirm && paymentState.mode === "Online" && (
        <div
          style={{
            marginTop: 16,
            background: "#91919111",
            border: "1.5px solid #919191",
            borderRadius: 7,
            padding: 12,
            fontWeight: 600
          }}
        >
          <div>
            You are paying by: <b>
              {(payment_methods.Online.find(m => m.value === paymentState.method) || {}).label || "PhonePe"}
            </b>
            <br />
            {/* Add sim transaction ref or success simulation */}
            <span style={{ fontSize: "0.97em", color: "#919191" }}>
              This is a simulated confirmation. Proceed to complete payment?
            </span>
          </div>
          <button
            className="btn"
            style={{
              background: "#12C984",
              color: "#fff",
              marginRight: 15,
              marginTop: 8,
              fontWeight: 700,
              border: "1.5px solid #919191"
            }}
            onClick={handleConfirmOnline}
          >
            Confirm Payment
          </button>
          <button
            className="btn"
            style={{
              background: "#caf0fe",
              color: "#222",
              fontWeight: 700,
              border: "1.5px solid #919191"
            }}
            onClick={handleCancelOnline}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ----- Customer Registration/Details Form -----
// Enhanced: allow showing/hiding chipId/usage based on prop, enlarge visually
function CustomerDetailForm({ value, onChange, onSubmit, errorPopup, showChip, showUsage }) {
  const [name, setName] = useState(value.name || '');
  const [phone, setPhone] = useState(value.phone || '');
  const [chipId, setChipId] = useState(value.chipId || '');
  const [usage, setUsage] = useState(value.usage || '');

  useEffect(() => {
    onChange({ name, phone, chipId, usage });
    // eslint-disable-next-line
  }, [name, phone, chipId, usage]);

  return (
    <form className="panel customer-details-large"
      style={{
        marginBottom: 32,
        marginTop: 18,
        maxWidth: 700,
        marginLeft: 'auto',
        marginRight: 'auto',
        boxShadow: '0 6px 32px #91919125'
      }}
      onSubmit={e => { e.preventDefault(); onSubmit(); }}>
      <div className="subtitle" style={{
        fontWeight: 900,
        marginBottom: 15,
        fontSize: '1.55em',
        letterSpacing: '0.01em',
        textAlign: 'center',
        color: '#1A1A1A'
      }}>Customer Details</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: "1.15em" }}>
        <div>
          <label style={{ fontWeight: 600 }}>Name:</label><br />
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={40}
            style={{ width: 160, fontSize: "1.17em", padding: '10px' }}
            placeholder="e.g. Arun Kumar"
          />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Phone #:</label><br />
          <input
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/,''))}
            required
            maxLength={10}
            minLength={10}
            pattern="^[0-9]{10}$"
            style={{ width: 130, fontSize: "1.17em", padding: '10px' }}
            placeholder="10 digits"
            inputMode="numeric"
          />
        </div>
        {showChip &&
          <div>
            <label style={{ fontWeight: 600 }}>Chip ID:</label><br />
            <input
              value={chipId}
              onChange={e => setChipId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              required
              maxLength={8}
              style={{ letterSpacing: 1, width: 120, fontSize: "1.17em", padding: '10px' }}
              placeholder="Alphanumeric, ≤8"
            />
          </div>
        }
        {showUsage &&
          <div>
            <label style={{ fontWeight: 600 }}>Usage (kWh):</label><br />
            <input
              value={usage}
              onChange={e => setUsage(e.target.value.replace(/[^0-9.]/g, ''))}
              type="number"
              required
              min="0"
              step="0.1"
              style={{ width: 110, fontSize: "1.17em", padding: '10px' }}
              placeholder="Numeric"
            />
          </div>
        }
      </div>
      <button className="btn" style={{
        marginTop: 18,
        fontWeight: 900,
        border: '2px solid #919191',
        color: '#fff',
        fontSize: '1.13em',
        paddingLeft: 30,
        paddingRight: 30
      }}>Submit</button>
      {errorPopup && <div style={{ marginTop: 18, color: '#800000', fontWeight: 700, fontSize: "1.1em", textAlign:"center" }}>{errorPopup}</div>}
    </form>
  );
}

// ----- Customer: Dashboard -----
function CustomerDashboard({ customer, usageRecord, previousDue, newBill }) {
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
        {typeof previousDue !== "undefined" && typeof newBill !== "undefined" ? (
          <>
            <div style={{fontWeight:600, fontSize:'1.09em', marginBottom:8}}>
              <span>Previous Due: </span>
              <span style={{color:'#800000', fontWeight:800}}>₹{previousDue}</span>
            </div>
            <div style={{fontWeight:600, fontSize:'1.09em', marginBottom:7}}>
              <span>New Bill: </span>
              <span style={{color:'#1A1A1A'}}>₹{newBill}</span>
            </div>
            <div style={{fontWeight:700, marginBottom:8}}>
              <b>Total Outstanding:</b> <span style={{color:'#e87a41', fontWeight:800, fontSize:'1.12em'}}>₹{previousDue+newBill}</span>
            </div>
          </>
        ) : null}
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

// --- LATE PAYMENT: Section logic ---

const LATE_PAYMENT_PERIOD_DAYS = 2; // Payment is due 2 days after usage update
const LATE_PAYMENT_REMINDER_INTERVAL = 7000; // ms between reminders

// Utility: Return date string X days in past
function daysAgoString(days) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toLocaleString('en-IN', { hour12: true });
}

// Utility: Add days to date string
function addDays(dateString, days) {
  const d = new Date(dateString);
  d.setDate(d.getDate() + days);
  return d;
}

// PUBLIC_INTERFACE
function isLatePayment(record) {
  // record: { updatedAt: string, paymentStatus: 'paid'|'unpaid' }
  if (!record || record.paymentStatus === 'paid') return false;
  const dueDate = addDays(record.updatedAt, LATE_PAYMENT_PERIOD_DAYS);
  return new Date() > dueDate;
}
// PUBLIC_INTERFACE
function latePaymentOverdueDays(record) {
  if (!record || record.paymentStatus === 'paid') return 0;
  const dueDate = addDays(record.updatedAt, LATE_PAYMENT_PERIOD_DAYS);
  const diff = (new Date() - dueDate) / (1000 * 60 * 60 * 24);
  return diff > 0 ? Math.floor(diff) : 0;
}
// PUBLIC_INTERFACE
function isPaymentDueSoon(record) {
  if (!record || record.paymentStatus === 'paid') return false;
  const dueDate = addDays(record.updatedAt, LATE_PAYMENT_PERIOD_DAYS);
  const now = new Date();
  return now < dueDate && (dueDate - now < 2 * 24 * 60 * 60 * 1000);
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

function App() {
  // State: role, login/credentials, customer/officer states
  const [role, setRole] = useState('');
  const [officerAuth, setOfficerAuth] = useState(null); // {id, name, pwd}
  const [customerAuth, setCustomerAuth] = useState(null); // {phone, name, pwd}
  const [officerLoginErr, setOfficerLoginErr] = useState("");
  const [customerLoginErr, setCustomerLoginErr] = useState("");

  const [customers] = useState(initialCustomers);
  const [usageRecords, setUsageRecords] = useState([]); // [{...}]
  const [notification, setNotification] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0].id);

  // Payment
  const [customerPaymentState, setCustomerPaymentState] = useState({}); // {mode, method}
  // Late payment warning
  const [reminderMessage, setReminderMessage] = useState('');
  const reminderTimerRef = useRef(null);

  // PUBLIC_INTERFACE
  function addUsage(customerId, usage, chipId) {
    const payable = calculatePayable(usage);
    const now = new Date().toLocaleString('en-IN', { hour12: true });
    setUsageRecords(prev => {
      const existing = prev.find(r => r.customerId === customerId && r.paymentStatus === 'unpaid');
      let updated = prev.filter(r => r.customerId !== customerId);
      if (existing) {
        const totalUsage = existing.usage + usage;
        const totalPayable = existing.payable + payable;
        updated.push({ customerId, usage: totalUsage, payable: totalPayable, chipId, updatedAt: now, paymentStatus: 'unpaid' });
      } else {
        updated.push({ customerId, usage, payable, chipId, updatedAt: now, paymentStatus: 'unpaid' });
      }
      return updated;
    });
    // Customer notification
    const customer = customers.find(c => c.id === customerId);
    setNotification(
      `Notification: ${customer.name} - New usage data entered. Payable Amount is ₹${payable}${(() => {
        const prevRec = usageRecords.find(
          r => r.customerId === customerId && r.paymentStatus === 'unpaid'
        );
        if (prevRec) {
          const sum = prevRec.payable + payable;
          return ` (Total Outstanding: ₹${sum})`;
        }
        return '';
      })()}.`
    );
  }

  // On paid
  function handleMarkPaid(type = "offline") {
    setUsageRecords(records =>
      records.map(r =>
        r.customerId === selectedCustomerId && r.paymentStatus !== "paid"
          ? { ...r, paymentStatus: 'paid', paymentType: type }
          : r
      )
    );
    setReminderMessage('');
    setCustomerPaymentState({});
  }
  function handleCloseNotification() { setNotification(''); }

  // Late payment reminder for customer only
  useEffect(() => {
    if (!role || role !== 'customer') {
      setReminderMessage('');
      if (reminderTimerRef.current) clearInterval(reminderTimerRef.current);
      return;
    }
    const usage = usageRecords.find(r => r.customerId === selectedCustomerId);

    if (
      usage &&
      usage.paymentStatus !== 'paid' &&
      isLatePayment(usage)
    ) {
      setReminderMessage(
        `⚠️ Late Payment Reminder: You have an overdue amount of ₹${usage.payable}. Please pay immediately!`
      );
      if (reminderTimerRef.current) clearInterval(reminderTimerRef.current);
      reminderTimerRef.current = setInterval(() => {
        setReminderMessage(
          `⚠️ Late Payment Reminder: You have an overdue amount of ₹${usage.payable}. Please pay immediately!`
        );
      }, LATE_PAYMENT_REMINDER_INTERVAL);
    } else if (
      usage &&
      usage.paymentStatus !== 'paid' &&
      isPaymentDueSoon(usage)
    ) {
      setReminderMessage(
        `⏰ Payment Due Soon: ₹${usage.payable} is due by ${addDays(
          usage.updatedAt,
          LATE_PAYMENT_PERIOD_DAYS
        ).toLocaleDateString('en-IN')} (${LATE_PAYMENT_PERIOD_DAYS} days after usage update)`
      );
      if (reminderTimerRef.current) clearInterval(reminderTimerRef.current);
    } else {
      setReminderMessage('');
      if (reminderTimerRef.current) clearInterval(reminderTimerRef.current);
    }
    return () => { if (reminderTimerRef.current) clearInterval(reminderTimerRef.current); };
    // eslint-disable-next-line
  }, [role, selectedCustomerId, usageRecords]);

  // Pop-up state for error/notification
  const [popup, setPopup] = useState('');
  // Customer registration details state for validation
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', chipId: '', usage: '' });
  const [customerFormComplete, setCustomerFormComplete] = useState(false);

  // --- MAIN UI STATE FLOW LOGIC ---

  let mainView;
  if (!role) {
    mainView = <RoleSelector setRole={role => { setRole(role); setOfficerAuth(null); setCustomerAuth(null); setOfficerLoginErr(""); setCustomerLoginErr(""); setCustomerFormComplete(false); setCustomerDetails({name:'', phone:'', chipId:'', usage:''}); }} />;
  }
  else if (role === 'officer') {
    // Officer login required
    if (!officerAuth) {
      mainView = (
        <OfficerLoginForm
          onLogin={(cred, err) => {
            if (err) return setOfficerLoginErr(err);
            // officerId+name entered, accept any mock
            setOfficerAuth(cred);
            setOfficerLoginErr("");
          }}
          errorMsg={officerLoginErr}
        />
      );
    } else {
      mainView = (
        <div>
          <div className="panel" style={{
            background: 'linear-gradient(120deg, #caf0fe 0%, #e6f3fa 100%)',
            marginBottom: 30,
            fontFamily: "'Montserrat', 'Poppins', Arial, sans-serif",
            fontWeight: 500,
            color: '#1a1a1a'
          }}>
            <h1 style={{ margin: 0, color: '#222' }}>EB Officer Dashboard</h1>
            <div className="description" style={{ color: '#555' }}>
              You can view customer electricity records and enter chip-based usage data below.
            </div>
          </div>
          {/* Officer usage entry & table (no 'late payment records') */}
          <OfficerUsageEntry customers={customers} addUsage={(c, u, chip) => {
            if (!chip.match(/^[a-z0-9]+$/i) || chip.length > 8) { setPopup('Chip ID must be alphanumeric and ≤ 8 characters.'); return; }
            if (isNaN(u) || u <= 0) { setPopup('Usage must be a positive number.'); return; }
            setPopup(''); addUsage(c, u, chip);
          }} />
          <OfficerUsageTable usageRecords={usageRecords} customers={customers} />
          {/* ENLARGED Customer details data for Officer - show all fields */}
          {!customerFormComplete &&
            <CustomerDetailForm
              value={customerDetails}
              onChange={setCustomerDetails}
              errorPopup={popup}
              onSubmit={() => {
                const { name, phone, chipId, usage } = customerDetails;
                if (!name || !phone || !chipId || !usage) { setPopup("All customer details are required."); return; }
                if (!/^[0-9]{10}$/.test(phone)) { setPopup("Phone number must be exactly 10 digits."); return; }
                if (!/^[a-zA-Z0-9]{1,8}$/.test(chipId)) { setPopup("Chip ID must be alphanumeric and ≤8 characters."); return; }
                if (!/^\d+(\.\d+)?$/.test(usage) || Number(usage)<=0) { setPopup("Usage must be a positive numeric value."); return; }
                setPopup(''); setCustomerFormComplete(true);
              }}
              showChip={true}
              showUsage={true}
            />
          }
          {popup && <NotificationBanner message={popup} onClose={() => setPopup('')} />}
        </div>
      );
    }
  }
  else if (role === 'customer') {
    // Customer login required
    if (!customerAuth) {
      mainView = (
        <CustomerLoginForm
          onLogin={(cred, err) => {
            if (err) return setCustomerLoginErr(err);
            setCustomerAuth(cred);
            setCustomerLoginErr("");
          }}
          errorMsg={customerLoginErr}
        />
      );
    } else {
      const customer = customers.find(c => c.id === selectedCustomerId);
      const thisCustomerUsage = usageRecords.filter(r => r.customerId === selectedCustomerId && r.paymentStatus !== 'paid');
      let previousDue = 0, newBill = 0;
      if (thisCustomerUsage.length) {
        if (thisCustomerUsage.length > 1) {
          previousDue = thisCustomerUsage.slice(0, -1).reduce((sum, r) => sum + r.payable, 0);
          newBill = thisCustomerUsage[thisCustomerUsage.length - 1].payable;
        } else {
          previousDue = 0;
          newBill = thisCustomerUsage[0].payable;
        }
      }
      const usage = usageRecords.find(r => r.customerId === selectedCustomerId);

      // Customer Detail Form: Only for new registrations, no chip/usage fields
      if (!customerFormComplete) {
        mainView = (
          <CustomerDetailForm
            value={customerDetails}
            onChange={setCustomerDetails}
            errorPopup={popup}
            onSubmit={() => {
              const { name, phone } = customerDetails;
              if (!name || !phone) { setPopup("All customer details are required."); return; }
              if (!/^[0-9]{10}$/.test(phone)) { setPopup("Phone number must be exactly 10 digits."); return; }
              setPopup(''); setCustomerFormComplete(true);
            }}
            showChip={false}
            showUsage={false}
          />
        );
      } else {
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

            {/* Bill/payment UI/late payment only for customers */}
            {usage && usage.paymentStatus !== "paid" &&
              <CustomerPaymentSection
                usageRecord={usage}
                onMarkPaid={handleMarkPaid}
                paymentState={customerPaymentState}
                setPaymentState={setCustomerPaymentState}
              />
            }
            <CustomerLatePaymentCard
              usageRecord={usage}
              onMarkPaid={() => handleMarkPaid(
                (customerPaymentState.mode === "Online" && customerPaymentState.method)
                  ? customerPaymentState.method
                  : (customerPaymentState.mode || "offline")
              )}
            />
            <CustomerDashboard
              customer={customer}
              usageRecord={usage}
              previousDue={previousDue}
              newBill={newBill}
            />
            {reminderMessage && (
              <div style={{
                marginTop: 20,
                background: "#e84545",
                color: "#fff",
                padding: "20px 18px",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: "1.12rem",
                boxShadow: "0 2px 12px #91919140",
                animation: "blinkme 0.8s linear infinite alternate"
              }}>
                {reminderMessage}
              </div>
            )}
          </>
        );
      }
    }
  }

  // NAV + Main area
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol" style={{ color: '#919191' }}>⚡</span> ElectroMonitor
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
                  fontWeight: 700,
                  color: '#fff'
                }}
                onClick={() => {
                  setRole('');
                  setOfficerAuth(null);
                  setCustomerAuth(null);
                  setOfficerLoginErr("");
                  setCustomerLoginErr("");
                  setPopup('');
                  setCustomerFormComplete(false);
                  setCustomerDetails({ name: '', phone: '', chipId: '', usage: '' });
                }}
              >
                Switch Role
              </button>
            }
          </div>
        </div>
      </nav>
      <NotificationBanner message={notification} onClose={handleCloseNotification} />
      {popup && <NotificationBanner message={popup} onClose={() => setPopup('')} />}
      <main>
        <div className="container" style={{ paddingTop: 100, paddingBottom: 48 }}>
          {mainView}
        </div>
      </main>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Render the "Late Payment" card for customers, bold & with visual attention for late.
 * Updates: navy border, maroon text, bold entries, warning icon for late.
 */
function CustomerLatePaymentCard({ usageRecord, onMarkPaid }) {
  if (!usageRecord) return null;
  const dueDate = usageRecord
    ? addDays(usageRecord.updatedAt, LATE_PAYMENT_PERIOD_DAYS)
    : null;

  // Fully paid card
  if (usageRecord.paymentStatus === 'paid')
    return (
      <div className="panel"
        style={{
          marginTop: 18,
          background: "#12C98422",
          color: "#000",
          border: "2.5px solid #12C984",
          borderLeft: "8px solid #12C984",
          fontWeight: 700,
          fontSize: "1.19em",
          boxShadow: "0 2px 7px #caf0fe55",
        }}
      >
        ✅ Payment Completed.<br />
        Thank you for your timely payment!
      </div>
    );

  // LATE payment version
  if (isLatePayment(usageRecord))
    return (
      <div className="panel late-payment-card"
        style={{
          marginTop: 16,
          background: "#f9fbfd",
          border: "3px solid #001f54", // Navy border
          borderLeft: "10px solid #800000", // Maroon highlight
          fontWeight: 900,
          color: "#001f54",
          boxShadow: "0 2px 13px #001f5415",
          fontSize: "1.04em"
        }}>
        <span style={{
          fontSize: "1.23em",
          color: "#800000",
          fontWeight: 900,
          letterSpacing: 0.01,
          display:'inline-flex',
          alignItems:'center'
        }}>
          <span role="img" aria-label="Warning" style={{marginRight:6, fontSize:"1.09em"}}>⚠️</span>
          Late Payment!
        </span>
        <br />
        <div style={{
          marginTop: 10,
          color: "#800000",
          fontWeight: 900,
          letterSpacing: 0.01,
          fontSize: "1.18em",
          display: "flex",
          flexDirection: "column",
          gap: "5px"
        }}>
          <div>
            <span style={{
              marginRight: 6,
              verticalAlign:'middle'
            }}>
              ⚠️
            </span>
            Amount overdue: <span style={{color:'#800000', fontWeight:900, fontSize:'1.23em'}}>₹{usageRecord.payable}</span>
          </div>
          <div>
            <span style={{marginRight:4}}>⚠️</span>
            Due date: <span style={{fontWeight:900}}>{dueDate && dueDate.toLocaleDateString('en-IN')}</span>
          </div>
          <div>
            <span style={{marginRight:4}}>⚠️</span>
            Overdue: <b>{latePaymentOverdueDays(usageRecord)}</b> day(s)
          </div>
        </div>
        <br />
        <button className="btn"
          style={{
            background: '#800000',
            color: '#fff',
            marginTop: 10,
            fontWeight: 700,
            border: "1.6px solid #001f54",
            boxShadow: "0 0 7px #80000025"
          }}
          onClick={onMarkPaid}
        >
          Mark as Paid Now
        </button>
      </div>
    );

  // Payment due soon, not yet late
  return (
    <div className="panel"
      style={{
        marginTop: 16,
        background: "#f7fbff",
        border: "3px solid #001f54", // Navy blue
        borderLeft: "8px solid #919191",
        fontWeight: 700,
        color: "#001f54",
        boxShadow: "0 2px 13px #001f5412"
      }}>
      <span style={{
        fontSize: "1.08em",
        color: "#001f54",
        fontWeight: 900
      }}>Payment Due Soon</span>
      <br />
      <span style={{color:'#222', fontWeight:700, fontSize:'1.09em'}}>
        Amount Due: <span style={{fontWeight: 900, color:'#001f54'}}>₹{usageRecord.payable}</span><br />
        Due by: <b>{dueDate && dueDate.toLocaleDateString('en-IN')}</b>
      </span>
      <br />
      <button className="btn"
        style={{
          background: '#caf0fe',
          color: '#001f54',
          marginTop: 10,
          border: '2px solid #001f54',
          fontWeight: 800
        }}
        onClick={onMarkPaid}
      >
        Mark as Paid
      </button>
    </div>
  );
}

export default App;
