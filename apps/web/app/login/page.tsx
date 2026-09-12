"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "../../store/api/authApi";
import { formatApiError, FormattedApiError } from "../../lib/errorUtils";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function LoginContent() {
  const [activeRole, setActiveRole] = useState<"customer" | "operator">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState<FormattedApiError | null>(null);
  const [emailError, setEmailError] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();

  const isExpiredSession = searchParams.get("reason") === "expired";
  const isRestricted = searchParams.get("reason") === "restricted";

  const isCustomer = activeRole === "customer";

  const handleRoleSwitch = (role: "customer" | "operator") => {
    setActiveRole(role);
    setErrorState(null);
    setEmail("");
  };

  const validateEmail = (val: string) => {
    setEmail(val);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val.length > 0 && !re.test(val)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  const fillCreds = (emailVal: string, passVal: string, role: "customer" | "operator") => {
    handleRoleSwitch(role);
    setEmail(emailVal);
    setPassword(passVal);
    validateEmail(emailVal);
    setErrorState(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);
    setIsSubmitting(true);

    try {
      const res = await login({ email, password }).unwrap();
      if (res?.token && typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
      }
      const redirectUrl = searchParams.get("redirect");
      const counterId = searchParams.get("counterId");
      if (res.user.role === "ADMIN") {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="w-full pt-16 bg-surface min-h-screen flex items-center justify-center">
        <div className="flex flex-col w-full items-center justify-center p-gutter-lg sm:p-space-xl">
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
            {/* Left Hero Context Column */}
            <div className="lg:col-span-5 flex flex-col space-y-space-lg text-on-surface">
              <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-md py-1.5 rounded-full w-fit">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-ui text-label-ui tracking-wide uppercase text-on-surface-variant">
                  System Status: Optimal • Latency 24ms
                </span>
              </div>
              <div className="space-y-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                    <span className="material-symbols-outlined text-2xl">sync_alt</span>
                  </div>
                  <span className="font-headline-lg text-headline-lg tracking-tight font-bold text-on-surface">
                    SQM System
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  High-throughput queue orchestrator for municipal centers, multi-specialty
                  triage clinics, and express counters.
                </p>
              </div>

              {/* Quick Metrics Snapshot Badge */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-sm">
                <div className="flex items-center justify-between text-on-surface-variant font-label-ui text-label-ui uppercase tracking-wider">
                  <span>Active Operations</span>
                  <span className="text-secondary font-semibold">Live Feed</span>
                </div>
                <div className="grid grid-cols-3 gap-space-sm pt-space-xs text-center">
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <div className="font-label-token-md text-label-token-md text-primary">
                      1,428
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Tokens Issued
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <div className="font-label-token-md text-label-token-md text-secondary">
                      4.2m
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Avg Wait
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <div className="font-label-token-md text-label-token-md text-on-surface">
                      99.98%
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Fulfillment
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Demo Access Tooltip/Box */}
              <div className="bg-surface-container p-space-md rounded-xl space-y-2 text-on-surface">
                <div className="flex items-center gap-space-xs font-headline-sm text-headline-sm text-primary">
                  <span className="material-symbols-outlined text-lg">
                    verified_user
                  </span>
                  <span>Fast-Track Review Logins</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Click to auto-populate credentials into the authentication form:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fillCreds("rahul.sharma@example.com", "Passkey@2025!", "customer")}
                    className="px-space-sm py-1 rounded bg-surface-container-lowest hover:bg-surface-bright shadow-sm font-label-token-sm text-label-token-sm text-on-surface flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">
                      person
                    </span>
                    Customer: rahul.sharma@example.com
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCreds("operator.deska@sqm.local", "MasterAuth#402", "operator")}
                    className="px-space-sm py-1 rounded bg-surface-container-lowest hover:bg-surface-bright shadow-sm font-label-token-sm text-label-token-sm text-on-surface flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm text-secondary">
                      support_agent
                    </span>
                    Operator: operator.deska@sqm.local
                  </button>
                </div>
              </div>
            </div>

            {/* Center/Right Form Card Column */}
            <div className="lg:col-span-7 flex justify-center mt-space-xl lg:mt-0">
              <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-md p-space-lg sm:p-space-xl relative overflow-hidden">
                {/* Subtle Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>
                
                {/* Role Toggle / Tabs */}
                <div className="flex bg-surface-container-low p-1 rounded-lg mb-space-lg" role="tablist">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch("customer")}
                    className={`flex-1 py-2 rounded-md font-label-ui text-label-ui text-center transition-all flex items-center justify-center gap-1.5 ${
                      isCustomer
                        ? "bg-surface-container-lowest shadow-sm text-primary font-bold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">person</span>
                    Customer Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch("operator")}
                    className={`flex-1 py-2 rounded-md font-label-ui text-label-ui text-center transition-all flex items-center justify-center gap-1.5 ${
                      !isCustomer
                        ? "bg-surface-container-lowest shadow-sm text-primary font-bold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      desktop_windows
                    </span>
                    Operator Console
                  </button>
                </div>

                {/* Card Header */}
                <div className="space-y-1 mb-space-md">
                  <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                    {isCustomer ? "Welcome Back" : "Station Clearance Terminal"}
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {isCustomer
                      ? "Sign in to manage your appointments or track your queue tokens in real time."
                      : "Operator verification required for desk queue distribution and token triage dispatch."}
                  </p>
                </div>

                {/* Session Expired / Restricted Alert Banner */}
                {isExpiredSession && !errorState && (
                  <div className="mb-space-md p-space-md bg-tertiary-container text-on-tertiary-container rounded-lg flex items-start gap-space-sm shadow-sm">
                    <span className="material-symbols-outlined text-tertiary shrink-0">
                      schedule
                    </span>
                    <div className="flex-1">
                      <p className="font-label-ui text-label-ui font-bold">
                        Session expired
                      </p>
                      <p className="font-body-sm text-body-sm mt-0.5">
                        Your session has expired. Please sign in again to continue.
                      </p>
                    </div>
                  </div>
                )}

                {isRestricted && !errorState && (
                  <div className="mb-space-md p-space-md bg-error-container text-on-error-container rounded-lg flex items-start gap-space-sm shadow-sm">
                    <span className="material-symbols-outlined text-error shrink-0">
                      lock
                    </span>
                    <div className="flex-1">
                      <p className="font-label-ui text-label-ui font-bold">
                        Access restricted
                      </p>
                      <p className="font-body-sm text-body-sm mt-0.5">
                        You don't have permission to access that page. Please sign in with an authorized account.
                      </p>
                    </div>
                  </div>
                )}

                {/* Dynamic Error Banner */}
                {errorState && (
                  <div className="mb-space-md p-space-md bg-error-container rounded-lg flex items-start gap-space-sm text-on-error-container shadow-sm">
                    <span className="material-symbols-outlined text-error shrink-0">
                      error
                    </span>
                    <div className="flex-1">
                      <p className="font-label-ui text-label-ui font-bold">
                        {errorState.title}
                      </p>
                      <p className="font-body-sm text-body-sm mt-0.5">
                        {errorState.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorState(null)}
                      className="text-on-error-container hover:opacity-75 p-1"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}

                {/* Form Elements */}
                <form className="space-y-space-md" noValidate onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-ui text-label-ui text-on-surface" htmlFor="emailInput">
                        Email Address
                      </label>
                      <span className="font-label-token-sm text-label-token-sm text-on-surface-variant uppercase tracking-wider">
                        {isCustomer ? "Customer Token ID" : "Counter Staff UUID"}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-xl">
                        alternate_email
                      </span>
                      <input
                        id="emailInput"
                        name="email"
                        type="email"
                        required
                        placeholder={isCustomer ? "rahul.sharma@example.com" : "operator.deska@sqm.local"}
                        value={email}
                        onChange={(e) => validateEmail(e.target.value)}
                        className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-3 py-2.5 rounded-lg shadow-sm focus:bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                      />
                    </div>
                    {emailError && (
                      <p className="font-body-sm text-body-sm text-error flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Please enter a valid work or personal email address.
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-ui text-label-ui text-on-surface" htmlFor="passInput">
                        Password
                      </label>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Encrypted SHA-256
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-xl">
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
                        className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-10 py-2.5 rounded-lg shadow-sm focus:bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                      />
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-outline hover:text-on-surface flex items-center justify-center p-1"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Form Options */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-surface-container-low text-primary focus:ring-primary-container focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface">
                        Remember me for 30 days
                      </span>
                    </label>
                    <a
                      href="#reset"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Password reset link has been dispatched to associated administrator/email.");
                      }}
                      className="font-body-sm text-body-sm text-primary hover:underline font-semibold"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 px-space-md rounded-lg font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-[0.99] disabled:opacity-80"
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-xl">
                          progress_activity
                        </span>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <span className="material-symbols-outlined text-lg">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Card Footer Info */}
                <div className="mt-space-lg pt-space-md bg-surface-container-low -mx-space-lg sm:-mx-space-xl -mb-space-lg sm:-mb-space-xl p-space-md rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                      Register for free tokens
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-label-token-sm text-label-token-sm justify-center sm:justify-start">
                    <span className="material-symbols-outlined text-sm text-secondary">
                      lock
                    </span>
                    256-Bit Vault
                  </div>
                </div>
              </div>
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
