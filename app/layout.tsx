"use client";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/cart" ||
    pathname === "/Address" ||
    pathname === "/payment";

  const hidefooter =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/cart" ||
    pathname === "/Address" ||
    pathname === "/payment";

  return (
    <html lang="en">
      <head>
        {/* ← YEH ADD KARO — Tabler Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
      </head>
      <body>
        {!hideNavbar && <Navbar />}
        {children}
        <Toaster position="top-right" />
        {!hidefooter && <Footer />}
      </body>
    </html>
  );
}