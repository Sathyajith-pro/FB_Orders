import { useState, useEffect, useCallback } from "react";
import styles from "../styles/Home.module.css";

const EMPTY_FORM = { itemNumber: "", name: "", address: "", phoneNumber: "", pieces: 1, price: "", note: "" };

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setError(data.error || "Failed to load orders from database.");
      }
    } catch {
      setError("Could not load orders. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const { itemNumber, name, address, phoneNumber, pieces, price, note } = form;
    if (!itemNumber || !name || !address || !phoneNumber || price === "") {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingOrderId ? `/api/orders/${editingOrderId}` : "/api/orders";
      const method = editingOrderId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setFormError(d.error || `Failed to ${editingOrderId ? "update" : "add"} order.`);
        return;
      }
      const savedOrder = await res.json();
      if (editingOrderId) {
        setOrders((prev) => prev.map((o) => (o._id === editingOrderId ? savedOrder : o)));
      } else {
        setOrders((prev) => [savedOrder, ...prev]);
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditingOrderId(null);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (order) => {
    setForm({
      itemNumber: order.itemNumber,
      name: order.name,
      address: order.address,
      phoneNumber: order.phoneNumber,
      pieces: order.pieces || 1,
      price: order.price || "",
      note: order.note || "",
    });
    setEditingOrderId(order._id);
    setShowForm(true);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
      } else {
        setError("Failed to delete order.");
      }
    } catch {
      setError("Failed to delete order.");
    }
  };

  const handleStatusToggle = async (order) => {
    const newStatus = order.status === "Pending" ? "Approved" : "Pending";
    setOrders((prev) =>
      prev.map((o) => (o._id === order._id ? { ...o, status: newStatus } : o))
    );
    try {
      await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id ? { ...o, status: order.status } : o
        )
      );
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.title}>Order Manager</h1>
            <p className={styles.subtitle}>Track and manage your business orders</p>
          </div>
          <button
            className={styles.addBtn}
            onClick={() => { setShowForm((v) => !v); setFormError(""); setEditingOrderId(null); setForm(EMPTY_FORM); }}
          >
            {showForm ? "✕ Cancel" : "+ New Order"}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{editingOrderId ? "Edit Order" : "Add New Order"}</h2>
            {formError && <div className={styles.formError}>{formError}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Item Number</label>
                  <input
                    className={styles.input}
                    name="itemNumber"
                    value={form.itemNumber}
                    onChange={handleChange}
                    placeholder="e.g. ORD-001"
                    autoFocus
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Customer Name</label>
                  <input
                    className={styles.input}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label className={styles.label}>Address</label>
                  <input
                    className={styles.input}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Delivery address"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    className={styles.input}
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Pieces</label>
                  <input
                    className={styles.input}
                    name="pieces"
                    type="number"
                    min="1"
                    value={form.pieces}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Price</label>
                  <input
                    className={styles.input}
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldWide}`}>
                  <label className={styles.label}>Note</label>
                  <input
                    className={styles.input}
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Any specific note about this order?"
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => { setShowForm(false); setFormError(""); setForm(EMPTY_FORM); setEditingOrderId(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : (editingOrderId ? "Update Order" : "Add Order")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.tableCard}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.tableHeader}>
            <span className={styles.count}>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Item #</th>
                  <th>Date & Time</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Pieces</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className={styles.emptyCell}>
                      <div className={styles.spinner} /> Loading orders…
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className={styles.emptyCell}>
                      No orders yet. Click <strong>+ New Order</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order._id} className={order.status === "Approved" ? styles.rowApproved : ""}>
                      <td className={styles.noCell}>{orders.length - index}</td>
                      <td className={styles.itemNum}>{order.itemNumber}</td>
                      <td className={styles.dateCell}>{formatDateTime(order.dateTime)}</td>
                      <td>{order.name}</td>
                      <td className={styles.address}>{order.address}</td>
                      <td>{order.phoneNumber}</td>
                      <td style={{ textAlign: "center" }}>{order.pieces || 1}</td>
                      <td>Rs. {order.price}</td>
                      <td>
                        <div className={styles.statusCell}>
                          <span className={`${styles.badge} ${order.status === "Approved" ? styles.badgeApproved : styles.badgePending}`}>
                            {order.status}
                          </span>
                          <label className={styles.checkLabel} title={order.status === "Pending" ? "Mark as Approved" : "Mark as Pending"}>
                            <input
                              type="checkbox"
                              checked={order.status === "Approved"}
                              onChange={() => handleStatusToggle(order)}
                              className={styles.checkbox}
                            />
                            <span className={styles.checkmark} />
                          </label>
                        </div>
                      </td>
                      <td className={styles.noteCell}>{order.note}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={styles.editBtn} onClick={() => handleEdit(order)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(order._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
