"use client";

// Currently shows an empty state — no Supabase queries yet.
//
// TO HOOK UP BACKEND:
//1. Create a `watchlist` table in Supabase:
//        id          uuid default gen_random_uuid() primary key
//        user_id     uuid references auth.users(id)
//        film_id     integer
//        title       text
//        poster_path text
//        created_at  timestamp default now()
//
// 2. Fetch the user's watchlist here:
//        const { data, count } = await supabase
//          .from("watchlist")
//          .select("film_id, title, poster_path", { count: "exact" })
//          .eq("user_id", user.id)
//          .order("created_at", { ascending: false })
//          .limit(4)
//        setItems(data ?? [])
//        setTotal(count ?? 0)
//
// 3. When a user clicks "Add to watchlist" on a film page, insert a row:
//        await supabase.from("watchlist").insert({ user_id, film_id, title, poster_path })

import Link from "next/link";

export default function WatchlistPreview() {
  const items: never[] = []; // placeholder — will be populated from Supabase

  return (
    <div className="mb-4 rounded-2xl border border-(--border) bg-(--surface) p-5.5">
      <div className="mb-3.5 text-[10px] font-semibold uppercase tracking-[1.8px] text-(--t3)">
        Watchlist
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 mb-3.5"></div>
      ) : (
        // Empty state — shown until backend is connected
        <div className="py-6 text-center">
          <p className="mb-1 text-[13px] text-(--t2)">No films saved yet</p>
          <p className="text-[11px] text-(--t3)">
            Films you save will appear here
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-(--border) pt-3.5">
        <span className="text-xs text-(--t3)"></span>
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-3.5 py-1.5 text-xs font-medium text-(--t2) no-underline transition-colors hover:border-(--border-h) hover:text-(--t1)"
        >
          Browse films →
        </Link>
      </div>
    </div>
  );
}
