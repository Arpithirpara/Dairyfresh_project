import styles from "../account.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../../config";

export default function Settings({ user }) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading,      setPwdLoading]      = useState(false);
  const [pwdMsg,          setPwdMsg]          = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const token  = typeof window !== "undefined" ? localStorage.getItem("token")  : "";
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : "";

  // ✅ Password Change — PUT /api/users/:id
  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setPwdMsg({ type: "error", text: "All fild are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "Passwords not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "Password minimum 6 characters required!" });
      return;
    }

    setPwdLoading(true);
    setPwdMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setPwdMsg({ type: "success", text: "Password successfully update" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwdMsg({ type: "error", text: data.message || "Update failed" });
      }
    } catch (err) {
      setPwdMsg({ type: "error", text: "Something went wrong" });
    } finally {
      setPwdLoading(false);
    }
  };
  return (
    <div>
      <h2 className={styles.heading}>Account Settings</h2>
      <p className={styles.subtext}>Manage your preferences</p>

      {/* Password Change */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Change Password</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>Current Password</label>
          <input
            type="password"
            className={styles.input}
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <input
            type="password"
            className={styles.input}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password</label>
          <input
            type="password"
            className={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {pwdMsg && (
          <p style={{
            fontSize: 13,
            marginBottom: 10,
            color: pwdMsg.type === "success" ? "var(--color-text-success)" : "var(--color-text-danger)"
          }}>
            {pwdMsg.text}
          </p>
        )}

        <button className={styles.saveBtn} onClick={handlePasswordChange} disabled={pwdLoading}>
          {pwdLoading ? "Updating..." : "Update Password"}
        </button>
      </div>

      </div>
  );
}