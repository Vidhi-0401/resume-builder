"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./logo";
import { useEffect, useState, useRef } from "react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data?.user || null);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/signin");
  };

  return (
    <header className="z-30 mt-2 w-full md:mt-5">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-gray-900/90 px-3
          before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]
          before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box]
          before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]
          after:absolute after:inset-0 after:-z-10 after:backdrop-blur-xs"
        >
          {/* Logo */}
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* Right Side */}
          <ul className="flex flex-1 items-center justify-end gap-3 relative">
            {loading ? (
              // Avatar loading shimmer
              <li className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-700 animate-pulse"></div>
              </li>
            ) : user ? (
              <li ref={dropdownRef} className="relative">
                {/* Avatar */}
                <button
                  onClick={() => setOpen(!open)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white hover:opacity-90 transition-all"
                  aria-label="User Menu"
                >
                  {user.name?.[0]?.toUpperCase() || "U"}
                </button>

                {/* Dropdown */}
                {open && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl bg-gray-800 shadow-lg ring-1 ring-gray-700 p-3 animate-fade-in">
                    <p className="text-gray-200 font-medium truncate">{user.name}</p>
                    <p className="text-gray-400 text-sm truncate">{user.email}</p>
                    <div className="border-t border-gray-700 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg bg-gradient-to-t from-red-600 to-red-500 text-white hover:opacity-90 transition-all"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/signin"
                    className="btn-sm bg-gradient-to-b from-gray-800 to-gray-700 py-[5px] px-4 text-gray-300 rounded-md hover:bg-gray-600 transition-all"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="btn-sm bg-gradient-to-t from-indigo-600 to-indigo-500 py-[5px] px-4 text-white rounded-md shadow hover:opacity-90 transition-all"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
