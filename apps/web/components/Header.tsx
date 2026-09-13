"use client";

import Link from "next/link";
import { useGetMeQuery, useLogoutMutation } from "../store/api/authApi";
import { useRouter } from "next/navigation";

import { useToast } from "./Toast";

export default function Header() {
  const { data: userResponse } = useGetMeQuery(undefined);
  const user = userResponse?.user || userResponse?.data;
  const toast = useToast();
  
  const [logout] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
      toast.info("Logged out successfully");
      // Hard redirect to clear all Redux state (RTK Query cache) and ensure username is wiped
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-xs sm:gap-space-md">
        <div className="flex items-center gap-space-xs sm:gap-space-lg">
          <Link href="/" className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[20px]">
                stacked_line_chart
              </span>
            </div>
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface text-sm sm:text-base md:text-lg">
              SQM <span className="text-primary-container">System</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-space-xs">
            <Link
              href="/"
              aria-current="page"
              className="px-2 sm:px-space-md py-1 sm:py-space-xs rounded-lg transition-colors bg-surface-container-high text-primary font-semibold text-xs sm:text-body-md"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="px-2 sm:px-space-md py-1 sm:py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors text-xs sm:text-body-md"
            >
              My Tokens
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-space-md">
          {!user ? (
            <div className="flex items-center gap-1 sm:gap-space-xs">
              <Link
                href="/login"
                className="px-2 sm:px-space-md py-1.5 sm:py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-ui text-[11px] sm:text-label-ui uppercase tracking-wider font-semibold"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-2.5 sm:px-space-md py-1.5 sm:py-space-xs rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-label-ui text-[11px] sm:text-label-ui uppercase tracking-wider font-semibold"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-space-xs">
              <button
                onClick={handleLogout}
                className="px-2 sm:px-space-md py-1.5 sm:py-space-xs rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors font-label-ui text-[11px] sm:text-label-ui uppercase tracking-wider font-semibold"
              >
                Logout
              </button>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-space-xs pl-1 sm:pl-space-xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[16px] sm:text-[18px]">
                  person
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-ui text-label-ui text-on-surface leading-none">
                  {user.name.split(" ")[0]}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant leading-none mt-0.5">
                  {user.role === "ADMIN" ? "Admin" : "Customer"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
