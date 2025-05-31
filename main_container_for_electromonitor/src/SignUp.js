import React, { useState } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Customer Registration (Sign Up) Form -- UI only, logic/stores fields for future use.
 * Only accessible/visible to customers. 
 */
function SignUp({ onRegister }) {
  // Example fields: phone, name, password (ready for more later)
  const [fields, setFields] = useState({
    phone: "",
    name: "",
    password: "",
    // Add new fields here as needed
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Placeholder validation, ready for detailed checks
    if (!fields.phone.trim() || !fields.name.trim() || !fields.password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!/^[0-9]{10}$/.test(fields.phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    // Registration logic goes here (future)
    if (onRegister) onRegister(fields);
  }

  return (
    <form
      className="login-form panel"
      onSubmit={handleSubmit}
      style={{
        maxWidth: 460,
        margin: "0 auto",
        marginTop: 80,
      }}
    >
      <div
        className="login-title subtitle"
        style={{ fontWeight: 800, fontSize: "1.7em", textAlign: "center" }}
      >
        Customer Sign Up
      </div>
      <div style={{ display: "grid", gap: 22, marginTop: 32 }}>
        <div>
          <label style={{ fontWeight: 600 }}>Phone Number:</label>
          <br />
          <input
            name="phone"
            value={fields.phone}
            onChange={handleChange}
            maxLength={10}
            minLength={10}
            inputMode="numeric"
            required
            placeholder="10 digits"
            style={{ fontSize: "1.15em" }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Name:</label>
          <br />
          <input
            name="name"
            value={fields.name}
            onChange={handleChange}
            required
            placeholder="Enter Name"
            style={{ fontSize: "1.15em" }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Password:</label>
          <br />
          <input
            name="password"
            type="password"
            value={fields.password}
            onChange={handleChange}
            required
            placeholder="Password"
            style={{ fontSize: "1.15em" }}
          />
        </div>
        {/* Future: Add more customer registration fields below as needed */}
        <button
          className="btn btn-large"
          style={{
            marginTop: 14,
            fontWeight: 700,
            fontSize: "1.12em",
          }}
          type="submit"
        >
          Sign Up
        </button>
      </div>
      {error && (
        <div style={{ marginTop: 18, color: "#800000", fontWeight: 700 }}>
          {error}
        </div>
      )}
    </form>
  );
}

export default SignUp;
