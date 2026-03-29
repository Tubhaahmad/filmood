"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Shared links visible to everyone
  const sharedItems = [
    { name: "Discover", href: "/mood" },
    { name: "Group", href: "/" },
  ];

  // Links that change based on auth state
  const authItems = user
    ? [
        { name: "Watchlist", href: "/watchlist" },
        { name: "Profile", href: "/profile" },
      ]
    : [
        { name: "Log in", href: "/login" },
        { name: "Sign up", href: "/signup" },
      ];

  const navItems = [...sharedItems, ...authItems];

  return (
    <nav className="bg-black p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          Filmood
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 ml-auto">
          {!loading &&
            navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-white hover:text-gray-300 transition duration-300"
              >
                {item.name}
              </Link>
            ))}

          {/* Sign out button — only when logged in */}
          {!loading && user && (
            <button
              onClick={signOut}
              className="text-white/50 hover:text-white transition duration-300 cursor-pointer"
            >
              Sign out
            </button>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden text-white text-2xl ml-auto transition-transform duration-300"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-80 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-end space-y-4">
          {!loading &&
            navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300 transition duration-300 transform hover:translate-x-1"
              >
                {item.name}
              </Link>
            ))}

          {!loading && user && (
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="text-white/50 hover:text-white transition duration-300 cursor-pointer"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
