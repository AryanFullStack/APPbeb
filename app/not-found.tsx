import Link from "next/link";
import { Icon } from "./components/ui-icon";

export default function NotFound() {
  return (
    <section className="login-wrap">
      <div className="login-card" style={{ textAlign: "center" }}>
        <div
          style={{
            width: 56,
            height: 56,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "var(--teal-soft)",
            color: "var(--teal)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon name="search" size={26} />
        </div>
        <div className="eyebrow">Page Not Found</div>
        <h1 style={{ marginTop: 6 }}>We couldn’t find that page.</h1>
        <p style={{ margin: "12px 0 24px" }}>
          The link may have expired, or the vacancy was moved by the employer.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link className="button button-teal" href="/jobs">
            Browse All Jobs <Icon name="arrow-up-right" size={14} />
          </Link>
          <Link className="button button-outline" href="/">
            Go to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
