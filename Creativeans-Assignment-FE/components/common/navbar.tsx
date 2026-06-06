"use client";

import { authCookies } from "@/lib/cookies";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/authstore";
import { Button } from "../ui/button";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuth((state) => state.token);
  const setToken = useAuth((state) => state.setToken);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
      const currentToken = token || authCookies.getToken();
      setIsLoggedIn(!!currentToken);
  }, [token]);

  const handleLogout = () => {
    authCookies.removeToken();
    setToken("");
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-primary text-2xl" data-icon="shopping_bag"></span>
              <span className="hidden sm:inline font-bold text-lg text-foreground">Creativeans Marketplace</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === "/" ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shop
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === "/about" ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Deals
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === "/contact" ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              New Arrivals
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 rounded-sm"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
            >
              <span className="material-symbols-outlined" data-icon={isOpen ? "close" : "menu"}>
                {isOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <Link
              href="/"
              className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                pathname === "/" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                pathname === "/about" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                pathname === "/contact" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
