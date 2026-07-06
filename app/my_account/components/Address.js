"use client";
import { useState, useEffect } from "react";
import styles from "../account.module.css";
import API_URL from "../../../config";

const EMPTY_FORM = {
  fullName: "",
  mobile: "",
  fullAddress: "",
  city: "",
  pincode: "",
};

export default function Addresses({ user }) {
  const [addresses, setAddresses]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [editingAddr, setEditingAddr] = useState(null);
  const [editForm, setEditForm]       = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm]         = useState(EMPTY_FORM);
  const [addLoading, setAddLoading]   = useState(false);
  const [addErrors, setAddErrors]     = useState({});

  // ── FETCH ──────────────────────────────────────────
  useEffect(() => {
    fetchAddresses();
  }, [user._id]);

  const fetchAddresses = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${API_URL}/api/address/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Support both array response and single object response
        if (Array.isArray(data.data)) {
          setAddresses(data.data);
        } else if (data.data) {
          setAddresses([data.data]);
        } else {
          setAddresses([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── VALIDATE ───────────────────────────────────────
  const validate = (form) => {
    const errs = {};
    if (!form.fullName.trim())    errs.fullName    = "Full name is required";
    if (!/^\d{10}$/.test(form.mobile)) errs.mobile = "Enter a valid 10-digit mobile number";
    if (!form.fullAddress.trim()) errs.fullAddress = "Address is required";
    if (!form.city.trim())        errs.city        = "City is required";
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = "Enter a valid 6-digit pincode";
    return errs;
  };

  // ── ADD NEW ────────────────────────────────────────
  const handleAdd = async () => {
    const errs = validate(addForm);
    if (Object.keys(errs).length) { setAddErrors(errs); return; }

    setAddLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${API_URL}/api/address`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) => [...prev, data.data]);
        setAddForm(EMPTY_FORM);
        setAddErrors({});
        setShowAddForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddLoading(false);
    }
  };

  // ── DELETE ─────────────────────────────────────────
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${API_URL}/api/address/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) => prev.filter((a) => a._id !== id));
        setDeletingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── EDIT OPEN ──────────────────────────────────────
  const handleEditOpen = (addr) => {
    setEditingAddr(addr._id);
    setEditForm({
      fullName:    addr.fullName,
      mobile:      addr.mobile,
      fullAddress: addr.fullAddress,
      city:        addr.city,
      pincode:     addr.pincode,
    });
  };

  // ── UPDATE ─────────────────────────────────────────
  const handleUpdate = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${API_URL}/api/address/${id}`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) =>
          prev.map((a) => (a._id === id ? { ...a, ...editForm } : a))
        );
        setEditingAddr(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className={styles.subtext}>Loading addresses...</p>;

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <div>
          <h2 className={styles.heading}>Saved Addresses</h2>
          <p className={styles.subtext}>{addresses.length} saved address{addresses.length !== 1 ? "es" : ""}</p>
        </div>

        {!showAddForm && (
          <button
            className={styles.saveBtn}
            onClick={() => { setShowAddForm(true); setAddForm(EMPTY_FORM); setAddErrors({}); }}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <i className="ti ti-plus" aria-hidden="true" />
            Add Address
          </button>
        )}
      </div>

      <div className={styles.addressList}>

        {/* ── ADD NEW FORM ── */}
        {showAddForm && (
          <div className={styles.addressCard}>
            <p className={styles.cardTitle}>New Address</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                placeholder="Enter full name"
                value={addForm.fullName}
                onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
              />
              {addErrors.fullName && <span style={{ color: "#e53e3e", fontSize: "0.75rem" }}>{addErrors.fullName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mobile</label>
              <input
                className={styles.input}
                placeholder="10-digit mobile number"
                value={addForm.mobile}
                onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                maxLength={10}
              />
              {addErrors.mobile && <span style={{ color: "#e53e3e", fontSize: "0.75rem" }}>{addErrors.mobile}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Full Address</label>
              <input
                className={styles.input}
                placeholder="House no., Street, Landmark"
                value={addForm.fullAddress}
                onChange={(e) => setAddForm({ ...addForm, fullAddress: e.target.value })}
              />
              {addErrors.fullAddress && <span style={{ color: "#e53e3e", fontSize: "0.75rem" }}>{addErrors.fullAddress}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input
                  className={styles.input}
                  placeholder="City"
                  value={addForm.city}
                  onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                />
                {addErrors.city && <span style={{ color: "#e53e3e", fontSize: "0.75rem" }}>{addErrors.city}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pincode</label>
                <input
                  className={styles.input}
                  placeholder="6-digit pincode"
                  value={addForm.pincode}
                  onChange={(e) => setAddForm({ ...addForm, pincode: e.target.value })}
                  maxLength={6}
                />
                {addErrors.pincode && <span style={{ color: "#e53e3e", fontSize: "0.75rem" }}>{addErrors.pincode}</span>}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "0.75rem" }}>
              <button
                className={styles.saveBtn}
                onClick={handleAdd}
                disabled={addLoading}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <i className="ti ti-map-pin-plus" aria-hidden="true" />
                {addLoading ? "Saving..." : "Save Address"}
              </button>
              <button
                className={styles.editBtn}
                onClick={() => { setShowAddForm(false); setAddErrors({}); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {addresses.length === 0 && !showAddForm && (
          <div
            style={{
              textAlign: "center",
              padding: "2.5rem 1rem",
              border: "2px dashed #e2e8f0",
              borderRadius: "12px",
              color: "#94a3b8",
            }}
          >
            <i className="ti ti-map-off" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No saved addresses yet</p>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
              Click "Add Address" to save your first delivery address.
            </p>
          </div>
        )}

        {/* ── ADDRESS CARDS ── */}
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`${styles.addressCard} ${
              deletingId === addr._id ? styles.addressDeleting : ""
            }`}
          >
            {/* ── EDIT MODE ── */}
            {editingAddr === addr._id ? (
              <div>
                <p className={styles.cardTitle}>Edit Address</p>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    className={styles.input}
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mobile</label>
                  <input
                    className={styles.input}
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    maxLength={10}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Address</label>
                  <input
                    className={styles.input}
                    value={editForm.fullAddress}
                    onChange={(e) => setEditForm({ ...editForm, fullAddress: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>City</label>
                    <input
                      className={styles.input}
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Pincode</label>
                    <input
                      className={styles.input}
                      value={editForm.pincode}
                      onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "0.75rem" }}>
                  <button
                    className={styles.saveBtn}
                    onClick={() => handleUpdate(addr._id)}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <i className="ti ti-check" aria-hidden="true" /> Save
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => setEditingAddr(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>

            ) : (
              /* ── VIEW MODE ── */
              <>
                <div className={styles.addressTop}>
                  <div className={styles.addressLabel}>
                    <i className="ti ti-map-pin" aria-hidden="true" />
                    {addr.fullName}
                  </div>
                  <div className={styles.addressActions}>
                    <button
                      className={styles.iconBtn}
                      title="Edit"
                      onClick={() => handleEditOpen(addr)}
                    >
                      <i className="ti ti-edit" aria-hidden="true" />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      title="Delete"
                      onClick={() => setDeletingId(addr._id)}
                    >
                      <i className="ti ti-trash" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p className={styles.addressText}>
                  {addr.fullAddress}, {addr.city} — {addr.pincode}
                </p>
                <p className={styles.addressText}>
                  <i className="ti ti-phone" aria-hidden="true" /> {addr.mobile}
                </p>

                {/* Delete Confirm */}
                {deletingId === addr._id && (
                  <div className={styles.deleteConfirm}>
                    <p className={styles.deleteConfirmText}>
                      <i className="ti ti-alert-triangle" aria-hidden="true" />
                      Are you sure? This address will be permanently deleted.
                    </p>
                    <div className={styles.deleteConfirmActions}>
                      <button
                        className={styles.confirmCancelBtn}
                        onClick={() => setDeletingId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.confirmDeleteBtn}
                        onClick={() => handleDelete(addr._id)}
                      >
                        <i className="ti ti-trash" aria-hidden="true" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}