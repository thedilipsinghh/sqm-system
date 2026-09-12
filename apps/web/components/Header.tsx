"use client";

import Link from "next/link";
import { useGetMeQuery, useLogoutMutation } from "../store/api/authApi";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: userResponse } = useGetMeQuery(undefined);
  const user = userResponse?.user || userResponse?.data;
  
  const [logout] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
      // Hard redirect to clear all Redux state (RTK Query cache) and ensure username is wiped
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg">
          <Link href="/" className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">
                stacked_line_chart
              </span>
            </div>
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface">
              SQM <span className="text-primary-container">System</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-space-xs">
            <Link
              href="/"
              aria-current="page"
              className="px-space-md py-space-xs rounded-lg transition-colors bg-surface-container-high text-primary font-semibold"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-body-md text-body-md"
            >
              My Tokens
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-space-md">
          {!user ? (
            <div className="hidden sm:flex items-center gap-space-xs">
              <Link
                href="/login"
                className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors font-label-ui text-label-ui uppercase tracking-wider"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-label-ui text-label-ui uppercase tracking-wider"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-space-xs">
              <button
                onClick={handleLogout}
                className="px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors font-label-ui text-label-ui uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-space-sm pl-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
              <div className="hidden lg:flex flex-col text-left">
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
