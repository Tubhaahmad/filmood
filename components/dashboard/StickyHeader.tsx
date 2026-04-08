"use client";

import Navbar from "../Navbar";
import GuestBanner from "./GuestBanner";

export default function StickyHeader() {
  return (
    <div className="sticky top-0 z-50">
      <GuestBanner />
      <Navbar />
    </div>
  );
}
