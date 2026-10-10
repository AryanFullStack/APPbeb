"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "./ui-icon";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("appbeb-cookie-consent-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("appbeb-cookie-consent-change", callback);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem("appbeb_cookie_consent");
  } catch {
    return "essential";
  }
}

function getServerSnapshot(): string | null {
  return "essential"; // Don't render banner during SSR
}

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleAccept() {
    try {
      localStorage.setItem("appbeb_cookie_consent", "all");
      window.dispatchEvent(new Event("appbeb-cookie-consent-change"));
    } catch {}
  }

  function handleEssentialOnly() {
    try {
      localStorage.setItem("appbeb_cookie_consent", "essential");
      window.dispatchEvent(new Event("appbeb-cookie-consent-change"));
    } catch {}
  }

  if (consent) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 620,
        margin: "0 auto",
        zIndex: 9999,
        background: "var(--bg-surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--teal-soft)",
            color: "var(--teal)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="lock" size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>
            Privacy & Cookie Preferences
          </h2>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--navy-muted)", lineHeight: 1.5 }}>
            AppBeb uses essential browser storage to preserve your local CV drafts securely on your device. We and verified partners may also use cookies for analytics and advertising measurement in compliance with Google AdSense and UK/EU GDPR guidelines. Read our{" "}
            <Link href="/privacy" style={{ color: "var(--teal)", textDecoration: "underline" }}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/cookies" style={{ color: "var(--teal)", textDecoration: "underline" }}>
              Cookie Details
            </Link>
            .
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleAccept}
              className="button button-teal button-small"
              style={{ padding: "6px 14px", fontSize: 13 }}
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="button button-outline button-small"
              style={{ padding: "6px 14px", fontSize: 13 }}
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
