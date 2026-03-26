import Link from "next/link";
import {
  FaGithub,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";

const footerLinks = [
  { name: "Discover", href: "/" },
  { name: "Group", href: "/" },
  { name: "Watchlist", href: "/watchlist" },
  { name: "Profile", href: "/profile" },
];

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/Tubhaahmad/filmood",
    icon: <FaGithub className="w-5 h-5" />,
  },
  {
    name: "Facebook",
    href: "https://facebook.com/filmood",
    icon: <FaFacebook className="w-5 h-5" />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/filmood",
    icon: <FaTwitter className="w-5 h-5" />,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/filmood",
    icon: <FaLinkedin className="w-5 h-5" />,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/filmood",
    icon: <FaInstagram className="w-5 h-5" />,
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white border-t border-gray-800 ">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        {/* Logo and tagline */}
        <div className="flex flex-col items-start gap-2">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight hover:text-gray-300 transition-colors"
          >
            Filmood
          </Link>
          <span className="text-sm text-gray-400">The movie is a mood.</span>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-wrap gap-6 items-center justify-center">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-300 hover:text-white transition-colors font-medium text-base"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Social icons */}
        <div className="flex gap-4 items-center">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={social.name}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-800 bg-black">
        © {new Date().getFullYear()} Filmood. All rights reserved.
      </div>
    </footer>
  );
}
