"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetMeQuery, useLogoutMutation } from "../store/api/authApi";

import { useToast } from "./Toast";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: userResponse } = useGetMeQuery(undefined);
  const user = userResponse?.user || userResponse?.data;
  const toast = useToast();
  
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
      toast.info("Logged out successfully");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToSection = (id: string) => {
    if (typeof window !== "undefined") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-inverse-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col">
        <div className="h-16 px-space-lg flex items-center justify-between bg-inverse-surface">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">
                hub
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-inverse-on-surface leading-none">
                SQM System <span className="text-primary-fixed">Admin</span>
              </span>
              <span className="font-body-sm text-body-sm text-outline-variant leading-none mt-1">
                Dispatch Terminal
              </span>
            </div>
          </div>
        </div>
        <div className="px-space-md py-space-xs">
          <div className="font-label-ui text-label-ui uppercase tracking-wider text-outline-variant px-space-sm mb-space-xs">
            Operations
          </div>
          <nav className="flex flex-col gap-1">
            <Link
              href="/admin/dashboard"
              onClick={() => scrollToSection("admin-stats")}
              className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors font-semibold ${
                pathname === "/admin/dashboard"
                  ? "bg-primary text-on-primary"
                  : "text-inverse-on-surface hover:bg-surface-variant/20"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard#counter-management"
              onClick={(e) => {
                if (pathname === "/admin/dashboard") {
                  e.preventDefault();
                  scrollToSection("counter-management");
                }
              }}
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-inverse-on-surface hover:bg-surface-variant/20 hover:text-inverse-on-surface transition-colors font-body-md text-body-md"
            >
              <span className="material-symbols-outlined text-[20px]">
                desktop_windows
              </span>
              Counters
            </Link>
            <Link
              href="/admin/dashboard#queue-management"
              onClick={(e) => {
                if (pathname === "/admin/dashboard") {
                  e.preventDefault();
                  scrollToSection("queue-management");
                }
              }}
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-inverse-on-surface hover:bg-surface-variant/20 hover:text-inverse-on-surface transition-colors font-body-md text-body-md"
            >
              <span className="material-symbols-outlined text-[20px]">
                linear_scale
              </span>
              Queue Management
            </Link>
          </nav>
        </div>
      </div>
      <div className="p-space-md bg-inverse-surface/90">
        <div className="flex items-center justify-between gap-space-xs p-space-xs rounded-lg bg-surface-variant/10">
          <div className="flex items-center gap-space-xs min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-ui text-label-ui text-inverse-on-surface truncate">
                {user ? user.name : "Guest"}
              </span>
              <span className="font-body-sm text-body-sm text-outline-variant truncate">
                {user ? (user.role === "ADMIN" ? "System Admin" : "User") : "Guest"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-outline-variant hover:bg-surface-variant/20 hover:text-inverse-on-surface transition-colors shrink-0"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
