import DashboardShell from "../components/dashboard/DashboardShell";
import HeroSection from "../components/dashboard/HeroSection";

export default function Home() {
  return (
    <main
      className="min-h-screen font-sans"
      style={{ background: "var(--bg)", color: "var(--t1)" }}
    >
      <HeroSection />
      <DashboardShell />
    </main>
  );
}
