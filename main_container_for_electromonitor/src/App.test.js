import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import App from "./App";

// Utility: Get buttons by text content OR role, robust for styling changes
function getButton(label) {
  return screen.getByRole("button", { name: new RegExp(label, "i") });
}

describe("ElectroMonitor Main Container", () => {
  // Helper for role switching
  function switchToRole(role) {
    // Should be on main role selector
    const btn = screen.getByRole("button", { name: new RegExp(role === "officer" ? "officer" : "customer", "i") });
    fireEvent.click(btn);
  }

  function fillOfficerUsage({ customerName, usage, chipId }) {
    // Select customer if not already
    const select = screen.getByLabelText(/customer/i);
    fireEvent.change(select, { target: { value: screen.getByText(customerName).parentElement.value || screen.getByText(customerName).closest("option").value } });

    // Fill usage and chip
    fireEvent.change(screen.getByLabelText(/usage/i), { target: { value: usage } });
    fireEvent.change(screen.getByLabelText(/chip id/i), { target: { value: chipId } });
    fireEvent.click(getButton("add usage"));
  }

  it("shows role selection on first load", () => {
    render(<App />);
    expect(screen.getByText(/select role/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /officer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /customer/i })).toBeInTheDocument();
  });

  it("can switch roles back and forth", () => {
    render(<App />);
    // Officer
    fireEvent.click(getButton("officer"));
    expect(screen.getByText(/usage data entry/i)).toBeInTheDocument();
    // Back to selector
    fireEvent.click(getButton("switch role"));
    expect(screen.getByText(/select role/i)).toBeInTheDocument();

    // Customer
    fireEvent.click(getButton("customer"));
    expect(screen.getByText(/select customer/i)).toBeInTheDocument();
    // Back to selector
    fireEvent.click(getButton("switch role"));
    expect(screen.getByText(/select role/i)).toBeInTheDocument();
  });

  it("officer can enter usage, see table update, triggers notification for customer", async () => {
    render(<App />);
    switchToRole("officer");

    // Table initially has no usage (all dashes)
    expect(screen.getByText("Arun Kumar")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(1);

    // Enter valid usage, chip id for Arun Kumar
    fillOfficerUsage({ customerName: "Arun Kumar", usage: "243", chipId: "CHIP99" });

    // Table should update for Arun Kumar
    expect(screen.getByText("CHIP99")).toBeInTheDocument();
    expect(screen.getByText("243")).toBeInTheDocument();

    // Payable: 100*3 + 143*5 = 300 + 715 = 1015
    expect(screen.getByText("₹1015")).toBeInTheDocument();

    // Notification banner appears
    await waitFor(() => {
      expect(screen.getByText(/notification:/i)).toBeInTheDocument();
      expect(screen.getByText(/arun kumar/i)).toBeInTheDocument();
      expect(screen.getByText(/payable amount is ₹1015/i)).toBeInTheDocument();
    });
  });

  it("officer's usage entry validates and shows error for bad input", () => {
    render(<App />);
    switchToRole("officer");

    // Bad usage (empty usage field)
    fireEvent.change(screen.getByLabelText(/usage/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/chip id/i), { target: { value: "CHIPBAD" } });
    fireEvent.click(getButton("add usage"));
    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();

    // Bad usage (0)
    fireEvent.change(screen.getByLabelText(/usage/i), { target: { value: "0" } });
    fireEvent.click(getButton("add usage"));
    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();

    // Bad chip id
    fireEvent.change(screen.getByLabelText(/usage/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/chip id/i), { target: { value: "" } });
    fireEvent.click(getButton("add usage"));
    expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
  });

  it("customer dashboard shows 'no data' when usage has not been entered", () => {
    render(<App />);
    switchToRole("customer");
    // For default Arun Kumar, no data
    expect(screen.getByText(/no usage data available/i)).toBeInTheDocument();
  });

  it("customer sees correct usage after EB officer adds data, across customers", async () => {
    render(<App />);
    // EB Officer adds usage for Arun Kumar and Sneha Bhat
    switchToRole("officer");
    fillOfficerUsage({ customerName: "Arun Kumar", usage: "250", chipId: "CHIPX" }); // Payable: 100*3 + 150*5 = 300+750=1050
    fillOfficerUsage({ customerName: "Sneha Bhat", usage: "85", chipId: "CHIPY" });  // Payable: 85*3=255

    // Switch to customer role (should default to Arun Kumar)
    fireEvent.click(getButton("switch role"));
    switchToRole("customer");

    // Arun Kumar
    expect(screen.getByText(/arun kumar/i)).toBeInTheDocument();
    expect(screen.getByText(/latest usage:/i)).toBeInTheDocument();
    expect(screen.getByText("250 kWh")).toBeInTheDocument();
    expect(screen.getByText("₹1050")).toBeInTheDocument();

    // Switch customer to Sneha Bhat
    fireEvent.change(screen.getByLabelText(/select customer/i), { target: { value: "c2" } });
    expect(screen.getByText(/sneha bhat/i)).toBeInTheDocument();
    expect(screen.getByText("85 kWh")).toBeInTheDocument();
    expect(screen.getByText("₹255")).toBeInTheDocument();

    // Switch customer to Ramya R. (should still show "no data")
    fireEvent.change(screen.getByLabelText(/select customer/i), { target: { value: "c3" } });
    expect(screen.getByText(/ramya r\./i)).toBeInTheDocument();
    expect(screen.getByText(/no usage data available/i)).toBeInTheDocument();
  });

  it("notification can be dismissed and disappears", async () => {
    render(<App />);
    switchToRole("officer");
    fillOfficerUsage({ customerName: "Arun Kumar", usage: "123", chipId: "CHIP123" });

    // Close notification
    await waitFor(() => {
      expect(screen.getByText(/notification:/i)).toBeInTheDocument();
    });
    fireEvent.click(getButton("close"));
    expect(screen.queryByText(/notification:/i)).not.toBeInTheDocument();
  });

  it("officer adding usage for the same customer replaces previous record", async () => {
    render(<App />);
    switchToRole("officer");
    // Add for Arun Kumar
    fillOfficerUsage({ customerName: "Arun Kumar", usage: "99", chipId: "F1" });
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("₹297")).toBeInTheDocument();

    // Add again for Arun Kumar (should overwrite)
    fillOfficerUsage({ customerName: "Arun Kumar", usage: "175", chipId: "F2" }); // 100*3 + 75*5 = 300+375 = 675
    expect(screen.getByText("175")).toBeInTheDocument();
    expect(screen.getByText("₹675")).toBeInTheDocument();
    expect(screen.getByText("F2")).toBeInTheDocument();
    // The old row for "99" and "₹297" should not be present for Arun Kumar
    expect(screen.queryByText("99")).not.toBeInTheDocument();
    expect(screen.queryByText("₹297")).not.toBeInTheDocument();
  });

  it("handles edge: data persists during role switch, customer selections persist", () => {
    render(<App />);
    // Officer enters usage for Arun Kumar
    switchToRole("officer");
    fillOfficerUsage({ customerName: "Arun Kumar", usage: "101", chipId: "K9" });

    // Switch to customer, see usage for Arun Kumar
    fireEvent.click(getButton("switch role"));
    switchToRole("customer");
    expect(screen.getByText("101 kWh")).toBeInTheDocument();

    // Switch to Sneha Bhat
    fireEvent.change(screen.getByLabelText(/select customer/i), { target: { value: "c2" } });
    expect(screen.getByText(/no usage data available/i)).toBeInTheDocument();

    // Switch back to officer and re-enter usage for Sneha, then return and verify
    fireEvent.click(getButton("switch role"));
    switchToRole("officer");
    fillOfficerUsage({ customerName: "Sneha Bhat", usage: "170", chipId: "QQ" });

    fireEvent.click(getButton("switch role"));
    switchToRole("customer");
    fireEvent.change(screen.getByLabelText(/select customer/i), { target: { value: "c2" } });
    expect(screen.getByText("170 kWh")).toBeInTheDocument();
    expect(screen.getByText("₹700")).toBeInTheDocument();
  });
});
