import Breadcrumb from "@/components/Breadcrumb";

export default function WatchlistPage() {
  return (
    <main className="min-h-screen px-4" style={{ background: "var(--bg)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "18px 0 60px" }}>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Watchlist" },
          ]}
        />
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
          <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--t1)" }}>My Watchlist</h1>
          <p style={{ color: "var(--t2)" }}>Watchlist coming soon...</p>
        </div>
      </div>
    </main>
  );
}
