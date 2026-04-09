import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer";
import AuthProvider from "../components/AuthProvider";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import StickyHeader from "@/components/dashboard/StickyHeader";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Filmood",
  description:
    "Tell Filmood how you want to feel. It tells you what to watch — alone or as a group.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${lora.variable} ${jakarta.variable}`}
    >
      <head>
        {/* Apply saved theme before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <StickyHeader />

          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
