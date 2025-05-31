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
  // Payable status can be "unpaid" or "paid"
  const [usageRecords, setUsageRecords] = useState([]); // [{customerId, usage, payable, chipId, updatedAt, paymentStatus}]
  const [notification, setNotification] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0].id);

  // Reminders for customer late payment
  const [reminderMessage, setReminderMessage] = useState('');
  const reminderTimerRef = useRef(null);

  // --- State-changing Handlers ---
  // PUBLIC_INTERFACE
  function addUsage(customerId, usage, chipId) {
    const payable = calculatePayable(usage);
    const now = new Date().toLocaleString('en-IN', { hour12: true });
    setUsageRecords(prev => {
      // Refactor: If there is an unpaid previous record, combine unpaid with new
      const existing = prev.find(r => r.customerId === customerId && r.paymentStatus === 'unpaid');
      let updated = prev.filter(r => r.customerId !== customerId);
      if (existing) {
        // Combine both usage and payables
        const totalUsage = existing.usage + usage;
        const totalPayable = existing.payable + payable;
        updated.push({
          customerId,
          usage: totalUsage,
          payable: totalPayable,
          chipId,
          updatedAt: now,
          paymentStatus: 'unpaid'
        });
      } else {
        updated.push({ customerId, usage, payable, chipId, updatedAt: now, paymentStatus: 'unpaid' });
      }
      return updated;
    });
    // Notification: Inform customer
    const customer = customers.find(c => c.id === customerId);
    setNotification(
      `Notification: ${customer.name} - New usage data entered. Payable Amount is ₹${payable}${
        (() => {
          // If there is an unpaid balance, notify about the sum as well
          const prevRec = usageRecords.find(
            r => r.customerId === customerId && r.paymentStatus === 'unpaid'
          );
          if (prevRec) {
            const sum = prevRec.payable + payable;
            return ` (Total Outstanding: ₹${sum})`;
          }
          return '';
        })()
      }.`
    );
  }
  // PUBLIC_INTERFACE
  function markPaymentDone(customerId) {
    setUsageRecords(records =>
      records.map(r =>
        r.customerId === customerId
          ? { ...r, paymentStatus: 'paid' }
          : r
      )
    );
    setReminderMessage('');
  }

  // Handler: Dismiss notification
  // PUBLIC_INTERFACE
  function handleCloseNotification() {
    setNotification('');
  }

  // Reminders: Customer late payment
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
      // Repeated reminders
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
    // Cleanup on unmount/role switch
    return () => {
      if (reminderTimerRef.current) clearInterval(reminderTimerRef.current);
    };
    // eslint-disable-next-line
  }, [role, selectedCustomerId, usageRecords]);

  // Role-based main view
  let mainView;
  if (!role) {
    mainView = <RoleSelector setRole={setRole} />;
  } else if (role === 'officer') {
    // Late payments for officer: collect list
    const lateList = customers
      .map(c => {
        const usage = usageRecords.find(r => r.customerId === c.id);
        return usage && isLatePayment(usage)
          ? {
              ...c,
              amount: usage.payable,
              overdueDays: latePaymentOverdueDays(usage),
              dueDate: addDays(usage.updatedAt, LATE_PAYMENT_PERIOD_DAYS).toLocaleDateString('en-IN'),
              updatedAt: usage.updatedAt,
            }
          : null;
      })
      .filter(Boolean);
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

        {/* Officer Late Payment Section */}
        <div className="panel late-payment-card-officer" style={{
          background: '#fff',
          border: '2.5px solid #001f54', // Navy blue border
          marginBottom: 24,
          fontWeight: 700, // Make the section a bit visually bolder
          boxShadow: "0 2px 10px #001f5420",
        }}>
          <div className="subtitle" style={{
            fontWeight: 800,
            color: "#001f54",
            marginBottom: 8,
            fontSize: "1.26rem",
            letterSpacing: 0.03,
          }}>
            Late Payment Records
          </div>
          {lateList.length === 0 ? (
            <div style={{color: '#919191', fontWeight: 500}}>No late payments at this time.</div>
          ) : (
            <table style={{
              width: '100%',
              fontSize: '1rem',
              borderCollapse: 'collapse',
              marginTop: 5,
              fontWeight: 700,
            }}>
              <thead>
                <tr style={{background:'#001f54'}}>
                  <th style={{padding:6, background:'#001f54', color:'#fff', fontWeight:700}}>Customer</th>
                  <th style={{padding:6, background:'#001f54', color:'#fff', fontWeight:700}}>Overdue Amount</th>
                  <th style={{padding:6, background:'#001f54', color:'#fff', fontWeight:700}}>Due Date</th>
                  <th style={{padding:6, background:'#001f54', color:'#fff', fontWeight:700}}>Overdue (days)</th>
                  <th style={{padding:6, background:'#001f54', color:'#fff', fontWeight:700}}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {lateList.map(entry => (
                  <tr key={entry.id}>
                    <td style={{
                      padding:6,
                      fontWeight:900,
                      color:'#800000', // Maroon
                      fontSize: '1.08em',
                      letterSpacing: 0.01,
                      display:'flex',
                      alignItems:'center',
                      gap: '0.6em'
                    }}>
                      <span style={{fontSize:'1.1em', verticalAlign:'sub'}}>⚠️</span>
                      {entry.name}
                    </td>
                    <td style={{
                      padding:6,
                      color:'#800000',
                      fontWeight: 900,
                      fontSize: '1.10em'
                    }}>
                      ₹{entry.amount}
                    </td>
                    <td style={{padding:6, color:'#800000', fontWeight:700}}>{entry.dueDate}</td>
                    <td style={{padding:6, color:'#800000', fontWeight:900}}>
                      {entry.overdueDays}
                    </td>
                    <td style={{
                      padding:6,
                      color:'#555',
                      fontWeight:600
                    }}>{entry.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

        {/* Customer: Late Payment Section */}
        <CustomerLatePaymentCard
          usageRecord={usage}
          onMarkPaid={() => markPaymentDone(selectedCustomerId)}
        />

        <CustomerDashboard customer={customer} usageRecord={usage} />
        {/* Prominent, visual reminder for late payments */}
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
            {usage && usage.paymentStatus !== 'paid' && (
              <>
                <button
                  className="btn"
                  style={{
                    marginLeft: 18,
                    background: '#caf0fe',
                    color: '#000',
                    fontWeight: 700,
                    border: '2px solid #fff',
                    boxShadow: 'none',
                  }}
                  onClick={() => markPaymentDone(selectedCustomerId)}
                >
                  Mark as Paid
                </button>
              </>
            )}
          </div>
        )}
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
                  fontWeight: 700,
                  color: '#fff'
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
