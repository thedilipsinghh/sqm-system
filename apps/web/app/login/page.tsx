"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "../../store/api/authApi";
import { formatApiError, FormattedApiError } from "../../lib/errorUtils";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { useToast } from "../../components/Toast";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorState, setErrorState] = useState<FormattedApiError | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const isExpiredSession = searchParams.get("reason") === "expired";
  const isRestricted = searchParams.get("reason") === "restricted";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);

    try {
      const res = await login({ email, password }).unwrap();
      if (res?.token && typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
      }
      toast.success("Login successful", "Welcome back!");
      const redirectUrl = searchParams.get("redirect");
      const counterId = searchParams.get("counterId");
      if (res?.user?.role === "ADMIN") {
        router.push(redirectUrl || "/admin/dashboard");
      } else {
        if (redirectUrl) {
          router.push(`${redirectUrl}${counterId ? `?counterId=${counterId}` : ""}`);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      const formatted = formatApiError(err, "login");
      setErrorState(formatted);
      toast.error(formatted.title, formatted.message);
    }
  };

  return (
    <>
      <Header />
      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 relative overflow-hidden">
        {/* Ambient Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-secondary-container/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-[480px] sm:max-w-[500px] mx-auto px-4 relative z-10">
          <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.07)] p-8 sm:p-11 border border-outline-variant/30 relative overflow-hidden transition-all hover:shadow-[0_28px_70px_rgba(0,0,0,0.1)]">
            
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

            {/* Header / Brand Badge */}
            <div className="text-center flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center mb-4 shadow-md shadow-primary/20 transform transition-transform hover:scale-105 duration-300">
                <span className="material-symbols-outlined text-[28px]">stacked_line_chart</span>
              </div>
              <span className="font-label-ui text-label-ui uppercase tracking-widest text-primary font-bold text-[11px] mb-1">
                Smart Queue Platform
              </span>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                Welcome Back
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mt-1.5 leading-relaxed">
                Sign in to manage your account and track your queue tokens in real time.
              </p>
            </div>

            {/* Session Expired / Restricted Alert Banner */}
            {isExpiredSession && !errorState && (
              <div className="mb-6 p-4 bg-tertiary-container/80 text-on-tertiary-container rounded-2xl flex items-start gap-3 shadow-sm border border-tertiary/20 font-body-sm animate-fadeIn">
                <span className="material-symbols-outlined text-tertiary shrink-0 text-[20px] mt-0.5">
                  schedule
                </span>
                <div>
                  <p className="font-label-ui font-bold">Session expired</p>
                  <p className="mt-0.5 opacity-90">Your session has expired. Please sign in again to continue.</p>
                </div>
              </div>
            )}

            {isRestricted && !errorState && (
              <div className="mb-6 p-4 bg-error-container/80 text-on-error-container rounded-2xl flex items-start gap-3 shadow-sm border border-error/20 font-body-sm animate-fadeIn">
                <span className="material-symbols-outlined text-error shrink-0 text-[20px] mt-0.5">
                  lock
                </span>
                <div>
                  <p className="font-label-ui font-bold">Access restricted</p>
                  <p className="mt-0.5 opacity-90">You don't have permission to access that section.</p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorState && (
              <div className="mb-6 p-4 bg-error-container/90 text-on-error-container rounded-2xl flex items-start gap-3 shadow-sm border border-error/30 font-body-sm animate-fadeIn">
                <span className="material-symbols-outlined text-error shrink-0 text-[20px] mt-0.5">
                  error
                </span>
                <div className="flex-1">
                  <p className="font-label-ui font-bold">{errorState.title}</p>
                  <p className="mt-0.5 opacity-90">{errorState.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorState(null)}
                  className="text-on-error-container hover:opacity-75 p-0.5 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label-ui text-label-ui text-on-surface font-semibold tracking-wide uppercase text-[12px] block" htmlFor="emailInput">
                  Email Address
                </label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-3.5 text-outline group-focus-within:text-primary transition-colors text-[20px] pointer-events-none">
                    mail
                  </span>
                  <input
                    id="emailInput"
                    name="email"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low/70 hover:bg-surface-container-low text-on-surface font-body-md text-body-md pl-11 pr-4 py-3 rounded-xl border border-outline-variant/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-ui text-label-ui text-on-surface font-semibold tracking-wide uppercase text-[12px] block" htmlFor="passInput">
                  Password
                </label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-3.5 text-outline group-focus-within:text-primary transition-colors text-[20px] pointer-events-none">
                    lock
                  </span>
                  <input
                    id="passInput"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low/70 hover:bg-surface-container-low text-on-surface font-body-md text-body-md pl-11 pr-11 py-3 rounded-xl border border-outline-variant/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-outline hover:text-on-surface flex items-center justify-center p-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 px-6 rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-[0.98] disabled:opacity-75 font-semibold mt-7"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[20px]">
                      progress_activity
                    </span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Footer / Register Prompt */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline transition-all">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
