"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Props {
  user: User;
}

export default function AccountSettings({ user }: Props) {
  const [name, setName] = useState(user.user_metadata?.full_name ?? "");
  const [email, setEmail] = useState(user.email ?? "");

  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<"saved" | "error" | null>(null);

  async function saveChanges() {
    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      ...(name !== user.user_metadata?.full_name
        ? { data: { full_name: name } }
        : {}),
      ...(email !== user.email ? { email } : {}),
    });

    setSaving(false);
    setEditingName(false);
    setEditingEmail(false);
    setToast(error ? "error" : "saved");
    setTimeout(() => setToast(null), 2400);
  }

  return (
    <>
      <div className="mb-4 rounded-2xl border border-(--border) bg-(--surface) p-5.5">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[1.8px] text-(--t3)">
          Account
        </div>

        <div className="mb-5">
          <span className="mb-2.5 block text-[11px] font-medium uppercase tracking-[1px] text-(--t3)">
            Personal
          </span>

          <div
            className={`mb-2 flex cursor-pointer items-center gap-2.5 rounded-[11px] border bg-(--surface2) px-3.5 py-3 transition-all ${
              editingName ? "border-(--gold)" : "border-(--border)"
            }`}
            style={
              editingName
                ? { boxShadow: "0 0 0 3px var(--gold-soft)" }
                : undefined
            }
          >
            <span className="shrink-0 text-[13px] text-(--t3)">👤</span>
            <div className="min-w-0 flex-1">
              <label htmlFor="profile-name" className="mb-0.5 text-[10px] text-(--t3)">Full name</label>
              <input
                id="profile-name"
                value={name}
                readOnly={!editingName}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-[13px] font-medium text-(--t1) outline-none"
              />
            </div>
            <button
              onClick={() => setEditingName(!editingName)}
              aria-label={editingName ? "Save name" : "Edit name"}
              className="shrink-0 cursor-pointer border-none bg-transparent text-[11px] font-medium text-(--t3) transition-colors hover:text-(--t1)"
            >
              {editingName ? "Done" : "Edit"}
            </button>
          </div>

          <div
            className={`mb-2 flex cursor-pointer items-center gap-2.5 rounded-[11px] border bg-(--surface2) px-3.5 py-3 transition-all ${
              editingEmail ? "border-(--gold)" : "border-(--border)"
            }`}
            style={
              editingEmail
                ? { boxShadow: "0 0 0 3px var(--gold-soft)" }
                : undefined
            }
          >
            <span className="shrink-0 text-[13px] text-(--t3)">✉</span>
            <div className="min-w-0 flex-1">
              <label htmlFor="profile-email" className="mb-0.5 text-[10px] text-(--t3)">
                Email address
              </label>
              <input
                id="profile-email"
                value={email}
                readOnly={!editingEmail}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-[13px] font-medium text-(--t1) outline-none"
              />
            </div>
            <button
              onClick={() => setEditingEmail(!editingEmail)}
              aria-label={editingEmail ? "Save email" : "Edit email"}
              className="shrink-0 cursor-pointer border-none bg-transparent text-[11px] font-medium text-(--t3) transition-colors hover:text-(--t1)"
            >
              {editingEmail ? "Done" : "Edit"}
            </button>
          </div>
        </div>

        <div className="mb-5">
          <span className="mb-2.5ock text-[11px] font-medium uppercase tracking-[1px] text-(--t3)">
            Security
          </span>

          <div className="flex items-center gap-2.5 rounded-[11px] border border-(--border) bg-(--surface2) px-3.5 py-3">
            <span className="shrink-0 text-[13px] text-(--t3)">🔒</span>
            <div className="flex-1">
              <div className="mb-0.5 text-[10px] text-(--t3)">Password</div>
              <div className="text-[13px] font-medium text-(--t1)">
                ••••••••
              </div>
            </div>
            <button className="shrink-0 cursor-pointer border-none bg-transparent text-[11px] font-medium text-(--t3) transition-colors hover:text-(--t1)">
              Change
            </button>
          </div>
        </div>

        <button
          onClick={saveChanges}
          disabled={saving}
          className="flex w-full cursor-pointer items-center justify-center rounded-[10px] border-none bg-(--gold) px-5 py-2.5 text-[13px] font-semibold text-[#0a0a0c] transition-all hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {toast && (
        <div
          className="fixed bottom-7 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-xl border px-5 py-3 text-[13px] font-medium shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          style={{
            background: "var(--surface)",
            borderColor: toast === "saved" ? "var(--teal)" : "var(--rose)",
            color: "var(--t1)",
          }}
        >
          <span
            style={{ color: toast === "saved" ? "var(--teal)" : "var(--rose)" }}
          >
            {toast === "saved" ? "✓" : "✕"}
          </span>
          {toast === "saved" ? "Changes saved" : "Something went wrong"}
        </div>
      )}
    </>
  );
}
