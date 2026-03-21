"use client";

import Link from "next/link";
import { useState } from "react"; // If using interactivity

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  //navigation items array
  const navItems = [
    { name: "Discover", href: "/" },
    { name: "Group", href: "/" },
    { name: "Log in", href: "/login" },
    { name: "Sign up", href: "/signup" },
  ];

  return (
    <nav className="bg-black p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          Filmood
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 ml-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative text-white hover:text-gray-300 transition duration-300"
            >
              {item.name}

              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
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

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-60 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-end space-y-4 px-">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300 transition duration-300 transform hover:translate-x-1"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
