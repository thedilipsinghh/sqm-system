"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "../../store/api/authApi";
import { formatApiError, FormattedApiError } from "../../lib/errorUtils";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterPage() {
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorState, setErrorState] = useState<FormattedApiError | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);
    
    try {
      const res = await register({ name, email, password, confirmPassword }).unwrap();
      if (res?.token && typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
      }
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      const formatted = formatApiError(err, "register");
      setErrorState(formatted);
    }
  };

  return (
    <>
      <Header />
      <main className="w-full pt-16 bg-surface min-h-screen flex items-center justify-center">
        <div className="flex flex-col w-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Hero Context Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 pt-2">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full text-on-surface-variant font-label-ui text-label-ui mb-4">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>LIVE TOKEN DISPATCH READY</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Smart Flow Access Portal
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
                  Experience zero physical wait times across municipal counters, diagnostic
                  centers, and service desks.
                </p>
              </div>

              <div className="bg-surface-container-low p-6 rounded-xl space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant">
                    Live System Telemetry
                  </span>
                  <span className="font-label-token-sm text-label-token-sm text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">sensors</span>{" "}
                    ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm">
                    <span className="font-label-ui text-label-ui text-on-surface-variant block">
                      Avg Wait Today
                    </span>
                    <span className="font-label-token-lg text-label-token-lg text-primary block mt-1">
                      4.2 min
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        trending_down
                      </span>{" "}
                      18% lower
                    </span>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm">
                    <span className="font-label-ui text-label-ui text-on-surface-variant block">
                      Desk Capacity
                    </span>
                    <span className="font-label-token-lg text-label-token-lg text-on-surface block mt-1">
                      16 / 18
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>{" "}
                      Normal load
                    </span>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">sms</span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface">
                        Precision SMS Pacing
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Alert triggers at exactly 2 slots before your turn.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">qr_code_2</span>
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface">
                        Contactless Check-In
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Instant kiosk scanning via device dynamic pass.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl h-44 shadow-sm bg-surface-container">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_SKn-REssDEkpHSfXscEDjZJpxuXGcLct6On0o0q57yYjiqghLJ5ICgw8hpWxVPoZMN8QH0OC4dmRDy8MkdHJv-_T3oVon2lE7FqiFsAYHgjm4b4avE7FzS4F23NJWIQViYMonuDNu13FqJaceUAquXEPJbs5VNIWgqVWSbBTxPe5daSC8Y_roJaaBF-8FzOKKwCfsF2mI76AaghvjesWinG5JQSr6jq0vbCfFdiNkBvqCE6dTsiI"
                  alt="Modern spacious clinical reception lobby"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent flex items-end p-4">
                  <div className="text-inverse-on-surface">
                    <span className="font-label-token-sm text-label-token-sm bg-primary-container px-2 py-0.5 rounded text-white inline-block mb-1">
                      STATION D-04
                    </span>
                    <p className="font-body-sm text-body-sm">
                      Serving Token #W-089 (Dr. K. Nair - General Triage)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Card Column */}
            <div className="lg:col-span-7">
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-md relative">
                
                {/* Toast Notification */}
                {showToast && (
                  <div
                    className="transition-all duration-500 opacity-100 mb-6 bg-secondary-container text-on-secondary-container p-4 rounded-lg flex items-center justify-between"
                    id="toastNotification"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">
                        check_circle
                      </span>
                      <div>
                        <p className="font-headline-sm text-headline-sm text-on-surface">
                          Account created successfully!
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Redirecting to queue dashboard...
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-on-surface-variant hover:text-on-surface"
                      onClick={() => setShowToast(false)}
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}

                <div className="mb-8">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Create Your Account
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Register to generate digital queue tokens and receive real-time
                    SMS/push alerts for your turn.
                  </p>
                </div>

                {errorState && (
                  <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg font-body-sm flex items-start justify-between gap-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-error text-lg shrink-0">error</span>
                      <div>
                        <p className="font-label-ui font-bold">{errorState.title}</p>
                        <p className="font-body-sm mt-0.5">{errorState.message}</p>
                      </div>
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

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      className="block font-label-ui text-label-ui text-on-surface"
                      htmlFor="full-name"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        id="full-name"
                        name="fullName"
                        type="text"
                        placeholder="Enter your legal name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3.5 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        required
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline text-lg">
                        person
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      className="block font-label-ui text-label-ui text-on-surface"
                      htmlFor="email-addr"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email-addr"
                        name="email"
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3.5 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all duration-200 pr-10"
                        required
                      />
                      <span
                        className="material-symbols-outlined absolute right-3 top-2.5 text-secondary text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary flex items-center gap-1 mt-0.5">
                      Email verified for digital receipt generation
                    </p>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label
                      className="block font-label-ui text-label-ui text-on-surface"
                      htmlFor="phone-number"
                    >
                      Mobile Number{" "}
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                        (For automated queue SMS alerts)
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-24 shrink-0 relative">
                        <select className="w-full bg-surface-container-low text-on-surface font-label-token-sm text-label-token-sm px-2.5 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer">
                          <option>+91</option>
                          <option>+1</option>
                          <option>+44</option>
                          <option>+971</option>
                          <option>+65</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-3 text-outline text-sm pointer-events-none">
                          expand_more
                        </span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          id="phone-number"
                          name="mobile"
                          type="tel"
                          placeholder="98765 43210"
                          className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-label-token-sm text-label-token-sm px-3.5 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                          required
                        />
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-outline text-lg">
                          call
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        className="block font-label-ui text-label-ui text-on-surface"
                        htmlFor="account-password"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="account-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••"
                          className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3.5 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all duration-200 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-outline hover:text-on-surface focus:outline-none"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      <div className="pt-1.5 space-y-1">
                        <div className="grid grid-cols-4 gap-1.5">
                          <div className="h-1.5 rounded-full bg-secondary"></div>
                          <div className="h-1.5 rounded-full bg-secondary"></div>
                          <div className="h-1.5 rounded-full bg-secondary"></div>
                          <div className="h-1.5 rounded-full bg-secondary"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Strength rating:
                          </span>
                          <span className="font-label-ui text-label-ui text-secondary flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>{" "}
                            Strong
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        className="block font-label-ui text-label-ui text-on-surface"
                        htmlFor="confirm-password"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••"
                          className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3.5 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all duration-200 pr-10"
                          required
                        />
                        <span
                          className="material-symbols-outlined absolute right-3 top-2.5 text-secondary text-lg"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-secondary flex items-center gap-1 mt-1">
                        Passwords match securely
                      </p>
                    </div>
                  </div>

                  {/* TOS Agreement */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary bg-surface-container accent-primary cursor-pointer"
                        required
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        I agree to the{" "}
                        <Link href="#" className="text-primary underline font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-primary underline font-medium">
                          Privacy Policy
                        </Link>{" "}
                        for automated queue notification and emergency queue transfers.
                      </span>
                    </label>
                  </div>

                  {/* Submit / Login Link */}
                  <div className="pt-2 space-y-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-75"
                    >
                      <span>{isLoading ? "Creating..." : "Create Account"}</span>
                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </button>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        Already have an account?
                      </span>
                      <Link
                        href="/login"
                        className="font-headline-sm text-headline-sm text-primary hover:underline"
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                </form>

                {/* Footer Badges */}
                <div className="mt-8 pt-6 bg-surface-container-low -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface-container-lowest text-primary shadow-sm">
                      <span className="material-symbols-outlined text-xl">encrypted</span>
                    </div>
                    <div>
                      <p className="font-label-ui text-label-ui text-on-surface">
                        HIPAA & SOC-2 Type II Certified
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Data encrypted at transit and rest for public and medical desks.
                      </p>
                    </div>
                  </div>
                  <span className="font-label-token-sm text-label-token-sm text-outline bg-surface-container-lowest px-2.5 py-1 rounded shadow-sm">
                    TLS 1.3 / ISO-27001
                  </span>
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
