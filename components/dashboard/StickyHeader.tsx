"use client";

import Navbar from "../Navbar";
import GuestBanner from "./GuestBanner";

export default function StickyHeader() {
  return (
    <header className="sticky top-0 z-50">
      <GuestBanner />
      <Navbar />
    </header>
  );
}
