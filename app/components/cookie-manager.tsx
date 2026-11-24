"use client";

import { useState, useEffect } from "react";
import { Icon } from "./ui-icon";

export function CookieManager() {
  const [currentConsent, setCurrentConsent] = useState<string>("essential");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    function loadConsent() {
      try {
        const stored = localStorage.getItem("appbeb_cookie_consent");
        setCurrentConsent(stored || "essential");
      } catch {
        setCurrentConsent("essential");
      }
    }
    loadConsent();
    window.addEventListener("appbeb-cookie-consent-change", loadConsent);
    return () => window.removeEventListener("appbeb-cookie-consent-change", loadConsent);
  }, []);

  function setConsent(choice: "all" | "essential") {
    try {
      localStorage.setItem("appbeb_cookie_consent", choice);
      setCurrentConsent(choice);
      window.dispatchEvent(new Event("appbeb-cookie-consent-change"));
      setStatusMessage(
        choice === "all"
          ? "Preferences updated: All cookies accepted."
          : "Preferences updated: Only strictly essential browser storage will be used."
      );
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setStatusMessage("Could not save preferences in this browser.");
    }
  }

  function resetConsent() {
    try {
      localStorage.removeItem("appbeb_cookie_consent");
      setCurrentConsent("unset");
      window.dispatchEvent(new Event("appbeb-cookie-consent-change"));
      setStatusMessage("Cookie preferences reset. The consent banner will reappear.");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setStatusMessage("Could not clear stored consent.");
    }
  }

  return (
    <div
      style={{
        marginTop: 28,
        padding: "24px 28px",
        background: "var(--bg-subtle)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>
          Manage Your Stored Preferences
        </h3>
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 999,
            background: currentConsent === "all" ? "var(--teal-soft)" : "var(--bg-surface)",
            color: currentConsent === "all" ? "var(--teal)" : "var(--navy-muted)",
            border: "1px solid var(--line)",
          }}
        >
          Status: {currentConsent === "all" ? "All Cookies Allowed" : currentConsent === "essential" ? "Essential Only" : "Not Set"}
        </span>
      </div>

      <p style={{ fontSize: 14, color: "var(--navy-muted)", lineHeight: 1.55, margin: "0 0 20px" }}>
        You can change or revoke your cookie choices at any time. Selecting &ldquo;Essential Only&rdquo; blocks non-essential telemetry and personalized advertising cookies while keeping your CV drafts safely autosaved in your browser.
      </p>

      {statusMessage && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--teal-soft)",
            color: "var(--teal)",
            borderRadius: "var(--radius-md)",
            fontSize: 13.5,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {statusMessage}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setConsent("all")}
          className="button button-teal button-small"
          style={{ padding: "8px 16px" }}
        >
          <Icon name="check" size={14} /> Accept All Cookies
        </button>
        <button
          type="button"
          onClick={() => setConsent("essential")}
          className="button button-outline button-small"
          style={{ padding: "8px 16px" }}
        >
          Reject Non-Essential (Essential Only)
        </button>
        <button
          type="button"
          onClick={resetConsent}
          className="button button-small"
          style={{
            padding: "8px 14px",
            background: "transparent",
            color: "var(--navy-muted)",
            border: "1px solid var(--line)",
          }}
        >
          Reset Preferences
        </button>
      </div>
    </div>
  );
}

