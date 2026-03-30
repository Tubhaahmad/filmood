import DashboardShell from "../components/dashboard/DashboardShell";

export default function Home() {
  return (
    <main
      className="min-h-screen font-sans"
      style={{ background: "var(--bg)", color: "var(--t1)" }}
    >
      <DashboardShell />
    </main>
  );
}
