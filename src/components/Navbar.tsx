"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/applications/new", label: "Add Application" },
  { href: "/contacts", label: "Contacts" },
  { href: "/contacts/new", label: "Add Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("careerflow_logged_in_user");
    setIsLoggedIn(!!loggedInUser);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("careerflow_logged_in_user");
    router.push("/login");
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage || !isLoggedIn) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#141417]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-8">

          {/* LOGO */}
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="CareerFlow Logo"
              width={180}
              height={50}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* NAV LINKS */}
          <div className="flex flex-wrap gap-2 text-sm">
            {appLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <button
          onClick={handleLogout}
          className="rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02] hover:opacity-95"
        >
          Logout
        </button>

      </div>
    </nav>
  );
}