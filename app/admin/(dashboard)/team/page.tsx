"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "../../../components/ui-icon";

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  status: "active" | "invited" | "suspended";
  created_at: string;
  last_active?: string;
  invite_token?: string;
  temporary_password?: string;
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    role: "admin" as "super_admin" | "admin" | "editor",
  });
  const [inviting, setInviting] = useState(false);
  const [latestInviteResult, setLatestInviteResult] = useState<{
    email: string;
    inviteLink: string;
    tempPassword: string;
  } | null>(null);

  // Password Update Modal State (For current user)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Reset Member Password Modal
  const [resetModalMember, setResetModalMember] = useState<AdminMember | null>(null);
  const [resetResult, setResetResult] = useState<{
    email: string;
    tempPassword: string;
    emailSent: boolean;
  } | null>(null);
  const [resetting, setResetting] = useState(false);

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  }

  async function loadMembers() {
    try {
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch {
      notify("Failed to load admin team members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.includes(q);
    });
  }, [members, search]);

  // Handle Send Invitation
  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setLatestInviteResult(null);

    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        notify(data.error || "Failed to invite member");
        setInviting(false);
        return;
      }

      setMembers((prev) => [data.member, ...prev]);
      setLatestInviteResult({
        email: data.member.email,
        inviteLink: data.inviteLink,
        tempPassword: data.temporaryPassword,
      });
      setInviteData({ name: "", email: "", role: "admin" });
      notify(`Invitation generated for ${data.member.email}`);
    } catch {
      notify("Network error while generating invitation");
    } finally {
      setInviting(false);
    }
  }

  // Handle Update Role
  async function handleUpdateRole(memberId: string, newRole: "super_admin" | "admin" | "editor") {
    try {
      const res = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId, role: newRole }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
        );
        notify("Member permissions updated");
      }
    } catch {
      notify("Failed to update role");
    }
  }

  // Handle Revoke Member
  async function handleRevoke(memberId: string, email: string) {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/members?id=${memberId}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        notify(`Access revoked for ${email}`);
      }
    } catch {
      notify("Failed to remove member");
    }
  }

  // Handle Reset Member Password
  async function handleResetPassword(member: AdminMember) {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, email: member.email }),
      });
      const data = await res.json();
      if (data.success) {
        setResetResult({
          email: member.email,
          tempPassword: data.temporaryPassword,
          emailSent: Boolean(data.emailSent),
        });
        notify(`Password reset for ${member.email}`);
      } else {
        notify(data.error || "Reset failed");
      }
    } catch {
      notify("Network error while resetting password");
    } finally {
      setResetting(false);
    }
  }

  // Handle Change My Password
  async function handleChangeMyPassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify("Passwords do not match");
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        notify(data.error || "Failed to update password");
        setSavingPassword(false);
        return;
      }

      setPasswordSuccess(data.message || "Password updated successfully!");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      notify("Your password was updated successfully!");
    } catch {
      notify("Network error while updating password");
    } finally {
      setSavingPassword(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    notify("Copied to clipboard!");
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="breadcrumb" style={{ marginBottom: 6 }}>
            <Link href="/admin">Admin</Link>
            <Icon name="chevron-right" size={12} />
            <span>Team & Access Control</span>
          </div>
          <h1 style={{ margin: "2px 0 4px", fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>
            Admin Team & Access Management
          </h1>
          <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 13 }}>
            Invite administrative members, control operational roles, and manage password security credentials.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="button button-small"
            style={{ fontWeight: 600 }}
          >
            <Icon name="lock" size={14} /> Update My Password
          </button>
          <button
            onClick={() => {
              setLatestInviteResult(null);
              setInviteModalOpen(true);
            }}
            className="button button-teal button-small"
            style={{ fontWeight: 700 }}
          >
            <Icon name="plus" size={14} /> Invite New Member
          </button>
        </div>
      </div>

      {notification && (
        <div style={{ padding: "10px 14px", background: "var(--teal-soft)", border: "1px solid var(--teal)", color: "var(--teal-dark)", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {notification}
        </div>
      )}

      {/* Generated Invite Box Banner (if any) */}
      {latestInviteResult && (
        <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--teal)", borderRadius: 12, padding: 18, marginBottom: 24, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--teal-dark)", fontSize: 15 }}>
              <Icon name="check-circle" size={18} /> Invitation Generated for {latestInviteResult.email}
            </div>
            <button
              onClick={() => setLatestInviteResult(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <p style={{ fontSize: 13, color: "var(--navy-muted)", margin: "0 0 12px" }}>
            Share the secure invitation link or temporary access credentials with the new team member:
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Direct Activation Link:</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  readOnly
                  className="input-control"
                  style={{ fontSize: 12, fontFamily: "monospace" }}
                  value={latestInviteResult.inviteLink}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(latestInviteResult.inviteLink)}
                  className="button button-small button-teal"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Icon name="copy" size={13} /> Copy Link
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--bg-page)", padding: "8px 12px", borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: "var(--navy-muted)" }}>Temporary Password / Key:</span>
              <strong style={{ fontFamily: "monospace", fontSize: 14, color: "var(--navy)" }}>{latestInviteResult.tempPassword}</strong>
              <button
                type="button"
                onClick={() => copyToClipboard(latestInviteResult.tempPassword)}
                style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
              >
                Copy Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Stats Bar */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ position: "relative", minWidth: 260 }}>
          <input
            type="text"
            className="input-control"
            placeholder="Search team members by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
          <Icon name="search" size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 12, fontWeight: 600, color: "var(--navy-muted)" }}>
          <span>Total Members: <strong>{members.length}</strong></span>
          <span>Active: <strong>{members.filter((m) => m.status === "active").length}</strong></span>
          <span>Pending Invitations: <strong>{members.filter((m) => m.status === "invited").length}</strong></span>
        </div>
      </div>

      {/* Members Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
              <th style={{ padding: "12px 16px" }}>Administrator Name & Email</th>
              <th style={{ padding: "12px 16px" }}>Role Access</th>
              <th style={{ padding: "12px 16px" }}>Account Status</th>
              <th style={{ padding: "12px 16px" }}>Last Activity</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
                  <Icon name="loader" size={20} className="spin" /> Loading team members…
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}>
                  No members found matching your search.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: member.role === "super_admin" ? "var(--teal)" : "var(--navy)",
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {member.name.charAt(0) || member.email.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--navy)" }}>{member.name}</div>
                        <div style={{ fontSize: 12, color: "var(--navy-muted)" }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      className="input-control"
                      style={{ padding: "4px 8px", fontSize: 12, width: "auto", fontWeight: 600 }}
                      value={member.role}
                      onChange={(e) =>
                        handleUpdateRole(member.id, e.target.value as "super_admin" | "admin" | "editor")
                      }
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Operations Admin</option>
                      <option value="editor">Content Editor</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          member.status === "active" ? "rgba(16, 185, 129, 0.1)" : "var(--amber-soft)",
                        color: member.status === "active" ? "#059669" : "var(--amber-dark)",
                      }}
                    >
                      {member.status === "active" ? "Active" : "Invitation Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--navy-muted)", fontSize: 12 }}>
                    {member.last_active || "Never"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setResetModalMember(member);
                          setResetResult(null);
                        }}
                        className="button button-small"
                        style={{ padding: "5px 10px", fontSize: 11 }}
                        title="Reset member password"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleRevoke(member.id, member.email)}
                        className="button button-small"
                        style={{ padding: "5px 10px", fontSize: 11, color: "var(--red-dark)", borderColor: "var(--red-border)" }}
                        title="Revoke access"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 100, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-surface)", width: "min(500px, 100%)", borderRadius: 14, padding: 26, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="users" size={20} style={{ color: "var(--teal)" }} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>
                  Invite New Admin Member
                </h2>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="input-control"
                  placeholder="e.g. Sarah Jenkins"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="field-label">Work Email *</label>
                <input
                  type="email"
                  required
                  className="input-control"
                  placeholder="sarah@company.com"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="field-label">Access Role Level</label>
                <select
                  className="input-control"
                  value={inviteData.role}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, role: e.target.value as "super_admin" | "admin" | "editor" })
                  }
                >
                  <option value="super_admin">Super Admin (Full access to all modules, team & SEO)</option>
                  <option value="admin">Operations Admin (Vacancies & Categories management)</option>
                  <option value="editor">Content Editor (Career Guides editing only)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="button button-small"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="button button-teal button-small"
                  style={{ fontWeight: 700 }}
                >
                  {inviting ? "Generating Invite…" : "Generate Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update My Password Modal */}
      {passwordModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 100, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-surface)", width: "min(460px, 100%)", borderRadius: 14, padding: 26, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="lock" size={20} style={{ color: "var(--teal)" }} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>
                  Update Administrator Password
                </h2>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {passwordSuccess && (
              <div style={{ padding: "10px 14px", background: "var(--teal-soft)", border: "1px solid var(--teal)", color: "var(--teal-dark)", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangeMyPassword} style={{ display: "grid", gap: 14 }}>
              <div>
                <label className="field-label">New Password (Min 8 characters) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input-control"
                  placeholder="••••••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="field-label">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input-control"
                  placeholder="••••••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="button button-small"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="button button-teal button-small"
                  style={{ fontWeight: 700 }}
                >
                  {savingPassword ? "Updating…" : "Save New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Member Password Modal */}
      {resetModalMember && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 100, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-surface)", width: "min(480px, 100%)", borderRadius: 14, padding: 26, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>
                Reset Member Password
              </h2>
              <button
                onClick={() => setResetModalMember(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: "var(--navy-muted)", margin: "0 0 16px" }}>
              Generate a temporary emergency password and dispatch reset instructions for{" "}
              <strong>{resetModalMember.email}</strong>.
            </p>

            {resetResult ? (
              <div style={{ background: "var(--bg-page)", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Temporary Credentials Generated:</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "monospace", color: "var(--navy)" }}>
                    {resetResult.tempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resetResult.tempPassword)}
                    className="button button-small button-teal"
                  >
                    <Icon name="copy" size={13} /> Copy
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
                  Provide this password to the administrator for immediate access.
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setResetModalMember(null)}
                className="button button-small"
              >
                Done
              </button>
              {!resetResult && (
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => handleResetPassword(resetModalMember)}
                  className="button button-teal button-small"
                  style={{ fontWeight: 700 }}
                >
                  {resetting ? "Resetting…" : "Confirm Password Reset"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
