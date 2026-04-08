"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function DangerZone() {
  const { signOut } = useAuth();
  const router = useRouter();

  // Signs the user out and redirects home
  async function handleLogOutAll() {
    await signOut();
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    await signOut();
    router.push("/");
  }

  const actions = [
    {
      title: "Log out of all devices",
      sub: "Ends all active sessions everywhere",
      label: "Log out all",
      danger: false,
      action: handleLogOutAll,
    },
    {
      title: "Delete account",
      sub: "Permanently removes all your data",
      label: "Delete",
      danger: true,
      action: handleDeleteAccount,
    },
  ];

  return (
    <div className="rounded-2xl border border-(--rose-soft,rgba(196,107,124,0.1)) bg-(--surface) p-5">
      {/* Section heading */}
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[1px] text-(--rose)">
        Danger zone
      </div>

      {actions.map((row, i) => (
        <div
          key={row.title}
          className={`flex items-center justify-between gap-4 py-2.5 ${
            i < actions.length - 1
              ? "border-b border-(--rose-soft,rgba(196,107,124,0.1))"
              : ""
          } ${i === 0 ? "pt-0" : ""}`}
        >
          <div>
            <p className="mb-0.5 text-[13px] font-medium text-(--t1)">
              {row.title}
            </p>
            <p className="text-[11px] text-(--t3)">{row.sub}</p>
          </div>

          <button
            onClick={row.action}
            className={`shrink-0 cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              row.danger
                ? "border border-[rgba(196,107,124,0.2)] bg-transparent text-(--rose) hover:bg-(--rose-soft) hover:border-(--rose)"
                : "border border-(--border) bg-transparent text-(--t2) hover:border-(--border-h) hover:text-(--t1)"
            }`}
          >
            {row.label}
          </button>
        </div>
      ))}
    </div>
  );
}
