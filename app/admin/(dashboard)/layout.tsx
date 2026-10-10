import { redirect } from "next/navigation";
import { getAdminSession } from "../../lib/admin-auth";
import { AdminNav } from "../components/admin-nav";
import { AdminHeader } from "../components/admin-header";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();

  // Strict Security Enforcement: Redirect unauthenticated requests to login
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <AdminNav userEmail={session.email} userRole={session.role} />
        <main className="admin-main">
          <AdminHeader userEmail={session.email} />
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
