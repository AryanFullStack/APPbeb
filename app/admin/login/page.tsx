"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from "../../components/ui-icon";

export default function AdminLoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"credentials" | "key">("credentials");
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("email") || "";
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [inviteNotice] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const invite = new URLSearchParams(window.location.search).get("invite");
      if (invite) {
        return "Welcome! Enter your temporary credentials to activate your admin account.";
      }
    }
    return null;
  });

  // Check if already authenticated
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => {
        if (res.ok) {
          router.replace("/admin");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, [router]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload =
        authMode === "credentials"
          ? { email, password }
          : { email: email || "admin@appbeb.com", adminKey };

      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Access denied.");
        setLoading(false);
        return;
      }

      // Success
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error communicating with authentication service.");
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="login-wrap" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", color: "var(--navy-muted)" }}>
          <Icon name="loader" size={24} className="spin" style={{ marginBottom: 12 }} />
          <div>Verifying security session…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap" style={{ minHeight: "100vh", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <form className="login-card" onSubmit={handleLogin} style={{ maxWidth: 460, width: "100%", boxShadow: "0 20px 40px -15px rgba(15,23,42,0.12)", borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="brand-mark" style={{ width: 30, height: 30, fontSize: 15 }}>A</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: "var(--navy)", letterSpacing: "-0.02em" }}>
              AppBeb<span style={{ color: "var(--teal)" }}>.</span>
            </span>
          </div>
          <span className="eyebrow" style={{ margin: 0, padding: "4px 10px", background: "var(--teal-soft)", color: "var(--teal-dark)", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
            <Icon name="lock" size={12} /> Restricted Portal
          </span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)", margin: "8px 0 4px" }}>Admin Sign In</h1>
        <p style={{ color: "var(--navy-muted)", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
          Authorized access for managing verified jobs, categories, career guides, and platform SEO.
        </p>

        {inviteNotice && (
          <div style={{ padding: "10px 14px", background: "var(--teal-soft)", border: "1.5px solid var(--teal)", color: "var(--teal-dark)", borderRadius: 8, fontSize: 12, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="check-circle" size={16} /> {inviteNotice}
          </div>
        )}

        {/* Authentication Mode Switcher */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: "var(--bg-page)", padding: 4, borderRadius: 10, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => { setAuthMode("credentials"); setError(""); }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              background: authMode === "credentials" ? "var(--bg-surface)" : "transparent",
              color: authMode === "credentials" ? "var(--navy)" : "var(--muted)",
              boxShadow: authMode === "credentials" ? "var(--shadow-xs)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            Supabase Account
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("key"); setError(""); }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              background: authMode === "key" ? "var(--bg-surface)" : "transparent",
              color: authMode === "key" ? "var(--navy)" : "var(--muted)",
              boxShadow: authMode === "key" ? "var(--shadow-xs)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            Admin Security Key
          </button>
        </div>

        {authMode === "credentials" ? (
          <>
            <label className="field-label" htmlFor="admin-email">
              Admin Email
            </label>
            <input
              id="admin-email"
              className="input-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@appbeb.com"
              autoComplete="email"
              required
            />

            <label className="field-label" htmlFor="admin-password" style={{ marginTop: 14 }}>
              Password
            </label>
            <input
              id="admin-password"
              className="input-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />
          </>
        ) : (
          <>
            <label className="field-label" htmlFor="admin-email-key">
              Operator Identifier (Email)
            </label>
            <input
              id="admin-email-key"
              className="input-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@appbeb.com"
            />

            <label className="field-label" htmlFor="admin-key" style={{ marginTop: 14 }}>
              Admin Access Key / Passphrase
            </label>
            <input
              id="admin-key"
              className="input-control"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter master admin key"
              required
            />
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--muted)", display: "flex", justifyContent: "space-between" }}>
              <span>Protected by role-level safeguards</span>
              <button
                type="button"
                onClick={() => setAdminKey("AppBebAdmin2026!")}
                style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", padding: 0, textDecoration: "underline", fontSize: 11 }}
              >
                Use default key
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="error-message" role="alert" style={{ marginTop: 16 }}>
            {error}
          </div>
        )}

        <button
          className="button button-teal"
          style={{ marginTop: 22, width: "100%", justifyContent: "center" }}
          disabled={loading}
          type="submit"
        >
          {loading ? (
            <span className="loading-label">
              <Icon name="loader" size={15} className="spin" /> Verifying Credentials…
            </span>
          ) : (
            <>
              Access Management Console <Icon name="arrow-up-right" size={15} />
            </>
          )}
        </button>

        <div style={{ marginTop: 22, textAlign: "center", borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <Link href="/" className="text-link" style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
            ← Return to public website
          </Link>
        </div>
      </form>
    </div>
  );
}
