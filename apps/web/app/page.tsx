"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useGetCountersQuery } from "../store/api/counterApi";
import { useGenerateTokenMutation, useGetCurrentCustomerTokenQuery, useLazyLookupTokenQuery } from "../store/api/tokenApi";
import { useGetMeQuery } from "../store/api/authApi";
import { useGetDashboardStatsQuery } from "../store/api/dashboardApi";

import { useToast } from "../components/Toast";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const { data: userResponse, isLoading: isAuthLoading } = useGetMeQuery(undefined);
  const user = userResponse?.user || userResponse?.data;

  const { data: currentTokenRes } = useGetCurrentCustomerTokenQuery(undefined, { skip: !user });
  const activeToken = currentTokenRes?.data;

  const { data: statsRes } = useGetDashboardStatsQuery(undefined, { pollingInterval: 5000 });
  const stats = statsRes?.data || { tokensToday: 0, waiting: 0, completed: 0, activeCounters: 0 };

  const { data: countersResponse, isLoading } = useGetCountersQuery(undefined, { pollingInterval: 3000 });
  const counters = countersResponse?.data || [];
  
  const [generateToken, { isLoading: isGeneratingToken }] = useGenerateTokenMutation();

  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupResultVisible, setLookupResultVisible] = useState(false);
  const [lookupTokenValue, setLookupTokenValue] = useState("");
  const [triggerLookup, { data: lookupRes, isLoading: isLookupLoading, isError: isLookupError, error: lookupError }] = useLazyLookupTokenQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ id: string; name: string; prefix: string } | null>(
    null
  );

  const handleOpenLookup = () => {
    setIsLookupOpen(!isLookupOpen);
    setLookupResultVisible(false);
    setLookupTokenValue("");
  };

  const handleVerifyToken = () => {
    const queryStr = lookupTokenValue.trim().toUpperCase();
    if (queryStr) {
      setLookupResultVisible(true);
      triggerLookup(queryStr);
    }
  };

  const handleOpenModal = (id: string, name: string, prefix: string) => {
    setModalData({ id, name, prefix });
    setIsModalOpen(true);
  };

  const handleGetTokenClick = (counter: any) => {
    if (isAuthLoading) return;
    if (!user) {
      router.push(`/login?redirect=/&counterId=${counter.id}`);
      return;
    }
    
    if (activeToken) {
      toast.warning(
        "Action Denied",
        "You already have an active token. Please complete or cancel your current token before requesting another one."
      );
      return;
    }

    if (counter.isPaused) {
      toast.warning("Queue Paused", "This queue is currently paused. Please try again when the queue resumes.");
      return;
    }

    handleOpenModal(counter.id, counter.name, counter.prefix);
  };

  useEffect(() => {
    const counterId = searchParams.get("counterId");
    if (counterId && counters.length > 0 && user) {
      if (activeToken) {
        toast.warning(
          "Action Denied",
          "You already have an active token. Please complete or cancel your current token before requesting another one."
        );
        router.replace("/");
      } else if (!isModalOpen) {
        const c = counters.find((x: any) => x.id === counterId);
        if (c && !c.isPaused && c.isActive) {
          handleOpenModal(c.id, c.name, c.prefix);
          router.replace("/");
        }
      }
    }
  }, [searchParams, counters, user, activeToken, isModalOpen, router, toast]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleConfirmToken = async () => {
    if (!modalData) return;
    try {
      const res = await generateToken({ counterId: modalData.id }).unwrap();
      handleCloseModal();
      toast.success(
        `Token ${res.data.tokenNumber} generated successfully`,
        "Your active token is now tracked on your dashboard."
      );
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: any) {
      handleCloseModal();
      toast.error(
        "Token generation failed",
        err?.data?.message || "Unable to generate token. Please try again."
      );
    }
  };

  return (
    <>
      <Header />
      <main className="w-full pt-16 bg-surface">
        <div className="flex flex-col w-full">
          {/* Operational Sub-Header Notice Bar */}
          <div className="w-full bg-surface-container-low py-space-sm px-margin">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-xs text-on-surface-variant">
              <div className="flex items-center gap-space-sm">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-ui text-label-ui">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  REAL-TIME ENGINE LIVE
                </span>
                <span className="font-body-sm text-body-sm text-on-surface">
                  Central Outpatient & Service Hall — Zone Alpha
                </span>
              </div>
              <div className="flex items-center gap-space-md font-label-token-sm text-label-token-sm">
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    schedule
                  </span>
                  Current Hub Latency: <strong className="text-on-surface">1.2s</strong>
                </span>
                <span className="hidden md:inline text-outline-variant">•</span>
                <span className="hidden md:flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[15px] text-secondary">
                    verified
                  </span>
                  Precision Triage Active
                </span>
              </div>
            </div>
          </div>

          {/* Primary Operations Entry Hero */}
          <section className="w-full max-w-7xl mx-auto px-margin py-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
              {/* Left Column: Command Entry */}
              <div className="lg:col-span-7 flex flex-col items-start">
                <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container text-primary font-label-ui text-label-ui uppercase tracking-wider mb-space-md">
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  Operational Dispatch Matrix
                </div>
                <h1 className="font-headline-xl text-headline-xl tracking-tight text-on-surface mb-space-sm">
                  Smart Queue Management
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-space-lg">
                  Join a queue digitally, track your position, and know when it is your
                  turn in real time.
                </p>

                {/* CTA Cluster */}
                <div className="flex flex-wrap items-center gap-space-md w-full sm:w-auto mb-space-xl">
                  <a
                    href="#counters-matrix"
                    className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:bg-primary shadow-sm transition-all focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      confirmation_number
                    </span>
                    <span>Get a Token</span>
                  </a>
                  <button
                    onClick={handleOpenLookup}
                    className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-lg bg-surface-container text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-high transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      manage_search
                    </span>
                    <span>Track My Token</span>
                  </button>
                </div>

                {/* Telemetry Pill / Ticker */}
                <div className="w-full max-w-lg p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">
                        Operational across {stats.totalCounters || counters.length} Service Desks
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Fleet telemetry synchronized 14s ago
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right pl-space-md sm:pl-0">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant block">
                      Average Wait
                    </span>
                    <span className="font-label-token-md text-label-token-md text-primary">
                      {stats.waiting > 0 ? "~" + (stats.waiting * 5) + " min" : "0 min"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Contextual System Snapshot Card */}
              <div className="lg:col-span-5 w-full">
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        display_settings
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Main Station Telemetry
                      </span>
                    </div>
                    <span className="font-label-token-sm text-label-token-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      HALL 1
                    </span>
                  </div>
                  {/* Fast Terminal Image Snapshot */}
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-surface-container">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcpYFtUcUf_bGXrUXKnd_qnyIWmqOL7K6xPo8t7tY5HwI0M8LDWlWD-DeQ4eOVjQWgcD-Qd5Cx7h37BRZKtdin6nCg3ZvjHqnJNJvcKn68Fs9SOCwsy3KHChDwKz9CaBzN-4FPr3U1_vd8X5Ubg5uAYzeQhQ4GO_jZWryMr4k3rYcbS5X_YTB2rkur9NVakfuNgWNRymmd678zZKXVgVg8JRJwoeo2vTqw7CsSw65Jv07-qGNzp8uD"
                      alt="A modern, high-throughput hospital and civic triage reception concourse..."
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-inverse-surface/90 text-inverse-on-surface p-space-xs px-space-sm rounded flex items-center justify-between font-label-token-sm text-label-token-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        GATE A-E BROADCAST
                      </span>
                      <span className="text-primary-fixed">DISPATCH ID #4092</span>
                    </div>
                  </div>
                  {/* Quick Stat Strip */}
                  <div className="grid grid-cols-3 gap-space-xs text-center pt-space-xs">
                    <div className="p-space-sm bg-surface-container-low rounded-lg">
                      <span className="font-body-sm text-body-sm text-on-surface-variant block">
                        In Queue
                      </span>
                      <span className="font-label-token-lg text-label-token-lg text-on-surface">
                        {stats.waiting}
                      </span>
                    </div>
                    <div className="p-space-sm bg-surface-container-low rounded-lg">
                      <span className="font-body-sm text-body-sm text-on-surface-variant block">
                        Now Serving
                      </span>
                      <span className="font-label-token-lg text-label-token-lg text-primary">
                        {counters[0]?.currentToken || "—"}
                      </span>
                    </div>
                    <div className="p-space-sm bg-surface-container-low rounded-lg">
                      <span className="font-body-sm text-body-sm text-on-surface-variant block">
                        Completed
                      </span>
                      <span className="font-label-token-lg text-label-token-lg text-secondary">
                        {stats.completed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Ticket Lookup Interactive Drawer */}
          {isLookupOpen && (
            <section
              className="w-full max-w-7xl mx-auto px-margin mb-space-xl block"
              id="lookup-modal"
            >
              <div className="w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-md">
                <div className="flex items-center justify-between pb-space-md mb-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        qr_code_scanner
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Token Position Tracker
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Enter your token reference code or scan confirmation slip
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenLookup}
                    className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-end">
                  <div className="md:col-span-7 flex flex-col gap-1.5">
                    <label
                      className="font-label-ui text-label-ui text-on-surface uppercase tracking-wider"
                      htmlFor="token-search-input"
                    >
                      Token Identifier
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                        <span className="material-symbols-outlined text-[20px]">pin</span>
                      </span>
                      <input
                        id="token-search-input"
                        type="text"
                        placeholder="e.g., A-023 or B-014"
                        value={lookupTokenValue}
                        onChange={(e) => setLookupTokenValue(e.target.value)}
                        className="w-full bg-surface-container-low text-on-surface font-label-token-md text-label-token-md pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:bg-surface-container-lowest"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-5 flex gap-space-sm">
                    <button
                      onClick={handleVerifyToken}
                      className="flex-1 py-2.5 px-space-md rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:bg-primary transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        search
                      </span>
                      Locate Position
                    </button>
                    <button className="py-2.5 px-space-md rounded-lg bg-surface-container-low text-on-surface font-label-ui text-label-ui hover:bg-surface-container transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">
                        photo_camera
                      </span>
                      Scan
                    </button>
                  </div>
                </div>
                {/* Result Component connected to Backend Lookup API */}
                {lookupResultVisible && (() => {
                  if (isLookupLoading) {
                    return (
                      <div className="mt-space-md p-space-md rounded-lg bg-surface-container-low text-on-surface-variant font-body-md flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                        <span>Searching database for token "{lookupTokenValue.trim().toUpperCase()}"...</span>
                      </div>
                    );
                  }

                  const tokenData = lookupRes?.data;

                  if (tokenData) {
                    const status = tokenData.status;
                    
                    const badgeStyles: Record<string, string> = {
                      WAITING: "bg-tertiary-fixed text-on-tertiary-fixed-variant border border-tertiary/30",
                      SERVING: "bg-secondary-fixed text-secondary border border-secondary/30 animate-pulse",
                      COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300",
                      SKIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300",
                      CANCELLED: "bg-error-container text-on-error-container border border-error/30",
                    };

                    const statusLabels: Record<string, string> = {
                      WAITING: "Waiting",
                      SERVING: "Serving",
                      COMPLETED: "Completed",
                      SKIPPED: "Skipped",
                      CANCELLED: "Cancelled",
                    };

                    return (
                      <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low block border border-outline-variant/30 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                          <div className="flex items-center gap-space-md">
                            <div className="px-space-md py-2 rounded-xl bg-surface-container-lowest font-label-token-lg text-label-token-lg text-primary font-bold uppercase shadow-sm border border-outline-variant/20">
                              {tokenData.tokenNumber}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                                {tokenData.counter?.name || "Service Desk"}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-body-sm text-body-sm text-on-surface-variant">Status:</span>
                                <span className={`px-2.5 py-0.5 rounded-full font-label-ui text-label-ui font-bold uppercase tracking-wider text-[11px] ${badgeStyles[status] || "bg-surface-container text-on-surface"}`}>
                                  {statusLabels[status] || status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Specific Metrics */}
                          {status === "WAITING" && (
                            <div className="flex items-center gap-space-lg flex-wrap">
                              <div>
                                <span className="font-label-ui text-label-ui text-on-surface-variant uppercase tracking-wider block">
                                  Queue Position
                                </span>
                                <span className="font-label-token-md text-label-token-md text-on-surface font-bold">
                                  {tokenData.peopleAhead !== null ? tokenData.peopleAhead + 1 : "—"}
                                </span>
                              </div>
                              <div>
                                <span className="font-label-ui text-label-ui text-on-surface-variant uppercase tracking-wider block">
                                  Currently Serving
                                </span>
                                <span className="font-label-token-md text-label-token-md text-primary font-bold">
                                  {tokenData.currentlyServing || "—"}
                                </span>
                              </div>
                              <div>
                                <span className="font-label-ui text-label-ui text-on-surface-variant uppercase tracking-wider block">
                                  Est. Wait
                                </span>
                                <span className="font-label-token-md text-label-token-md text-secondary font-bold">
                                  {tokenData.estimatedWait || "—"}
                                </span>
                              </div>
                            </div>
                          )}

                          {status === "SERVING" && (
                            <div className="flex items-center gap-space-md">
                              <div className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 font-body-sm font-semibold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">campaign</span>
                                <span>Currently being served at desk</span>
                              </div>
                            </div>
                          )}

                          {status === "COMPLETED" && (
                            <div className="flex items-center gap-space-md">
                              <div className="font-body-sm text-body-sm text-on-surface-variant">
                                {tokenData.completedAt ? `Completed at ${new Date(tokenData.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Service Completed"}
                              </div>
                            </div>
                          )}

                          {status === "SKIPPED" && (
                            <div className="flex items-center gap-space-md">
                              <div className="font-body-sm text-body-sm text-on-surface-variant">
                                Token was skipped by desk operator
                              </div>
                            </div>
                          )}

                          {status === "CANCELLED" && (
                            <div className="flex items-center gap-space-md">
                              <div className="font-body-sm text-body-sm text-on-surface-variant">
                                Token was cancelled
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const is404 = (lookupError as any)?.status === 404 || lookupRes?.success === false;

                  if (is404 || isLookupError || (lookupRes && !tokenData)) {
                    return (
                      <div className="mt-space-md p-space-md rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline">search_off</span>
                        <span className="font-semibold text-on-surface">Token not found.</span>
                        <span>Please check the token number and try again.</span>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            </section>
          )}

          {/* 3-Step "How It Works" Section */}
          <section id="how-it-works" className="w-full bg-surface-container-low py-space-xl">
            <div className="max-w-7xl mx-auto px-margin">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-sm">
                <div>
                  <div className="font-label-ui text-label-ui uppercase tracking-wider text-primary mb-1">
                    Standard Intake Protocol
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    How It Works
                  </h2>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                  Transparent, self-directed client progression with zero desk loitering
                  and guaranteed automated queue sequencing.
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-lg">
                {/* Step 1 */}
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-md">
                      <span className="material-symbols-outlined text-[24px]">
                        corporate_fare
                      </span>
                    </div>
                    <div className="font-label-token-sm text-label-token-sm text-primary mb-1">
                      PHASE 01
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
                      1. Choose a Counter
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Select the department or service desk you need (Registration,
                      Billing, Consultation). Review live queue loads prior to commitment.
                    </p>
                  </div>
                  <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-ui text-label-ui">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        check_circle
                      </span>
                      5 Active Categories
                    </span>
                    <span>Real-time Est.</span>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-md">
                      <span className="material-symbols-outlined text-[24px]">
                        local_activity
                      </span>
                    </div>
                    <div className="font-label-token-sm text-label-token-sm text-primary mb-1">
                      PHASE 02
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
                      2. Get Your Token
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Receive an instant digital queue token with estimated time and queue
                      position. Save directly to mobile wallet or retain passcode.
                    </p>
                  </div>
                  <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-ui text-label-ui">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        check_circle
                      </span>
                      SMS & Web Receipt
                    </span>
                    <span>Zero Touch</span>
                  </div>
                </div>
                {/* Step 3 */}
                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-md">
                      <span className="material-symbols-outlined text-[24px]">
                        notifications_active
                      </span>
                    </div>
                    <div className="font-label-token-sm text-label-token-sm text-primary mb-1">
                      PHASE 03
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
                      3. Track Your Turn
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                      Monitor live serving position from your smartphone or screen display.
                      Move freely around the hub until your chime summons you.
                    </p>
                  </div>
                  <div className="pt-space-md flex items-center justify-between text-on-surface-variant font-label-ui text-label-ui">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        check_circle
                      </span>
                      Multi-display Audio
                    </span>
                    <span>Auto Recall</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Queue Preview Matrix (Major Operational Centerpiece) */}
          <section
            className="w-full max-w-7xl mx-auto px-margin py-space-xl"
            id="counters-matrix"
          >
            {/* Main Container Card */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-md p-space-lg md:p-space-xl">
              {/* Header with Operational Filter Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-md mb-space-md border-b border-outline-variant/30">
                <div>
                  <div className="flex items-center gap-space-xs mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span className="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant font-semibold">
                      ACTIVE OPERATIONS GRID
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    Live Counter Directory
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-space-sm">
                  <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
                    <button className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-primary font-label-ui text-label-ui shadow-sm font-semibold">
                      All Desks ({stats.totalCounters || counters.length})
                    </button>
                    <button className="px-space-md py-1.5 text-on-surface-variant font-label-ui text-label-ui hover:text-on-surface transition-colors font-medium">
                      Available Now
                    </button>
                  </div>
                  <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-xl bg-surface-container-low text-on-surface-variant font-label-token-sm text-label-token-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      autorenew
                    </span>
                    Auto-updates every 10s
                  </div>
                </div>
              </div>

              {/* Counters Stream Table / List */}
              <div className="rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-container-low/20">
                {/* Desktop Column Headers */}
                <div className="hidden md:grid md:grid-cols-12 gap-space-md px-space-lg py-3.5 bg-surface-container-low/80 border-b border-outline-variant/30 font-label-ui text-[12px] uppercase text-on-surface font-bold tracking-wider">
                  <div className="col-span-4">Service Counter / Prefix</div>
                  <div className="col-span-2">Currently Serving</div>
                  <div className="col-span-2">Queue Velocity</div>
                  <div className="col-span-2">Operational State</div>
                  <div className="col-span-2 text-right">Action Trigger</div>
                </div>

                {/* Mapped Counters */}
                {isLoading ? (
                  <div className="p-space-lg text-center text-on-surface-variant font-label-ui">Loading counters...</div>
                ) : counters.map((counter: any, idx: number) => {
                  const isActive = counter.isActive;
                  const isPaused = counter.isPaused;
                  const isUnavailable = !isActive && !isPaused;
                  
                  return (
                    <div
                      key={counter.id}
                      className={`p-space-lg md:px-space-lg md:py-4 flex flex-col md:grid md:grid-cols-12 gap-space-md md:items-center border-b border-outline-variant/20 last:border-b-0 transition-colors ${
                        isActive && !isPaused
                          ? "bg-surface-container-lowest hover:bg-surface-container-low/50"
                          : isPaused
                          ? "bg-surface-container-low/40"
                          : "bg-surface-container-low/60"
                      }`}
                    >
                      {/* Counter Info & Prefix */}
                      <div className="md:col-span-4 flex items-center gap-space-md">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-label-token-md text-label-token-md font-bold shadow-sm border ${
                            isActive && !isPaused
                              ? "bg-primary-container/20 border-primary/30 text-primary"
                              : isPaused
                              ? "bg-tertiary-fixed/40 border-tertiary/30 text-tertiary"
                              : "bg-surface-container-high border-outline-variant/30 text-outline"
                          }`}
                        >
                          {counter.prefix}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <span
                              className={`font-headline-sm text-headline-sm font-semibold ${
                                isUnavailable ? "text-outline" : "text-on-surface"
                              }`}
                            >
                              Counter {idx + 1}: {counter.name}
                            </span>
                          </div>
                          {counter.description && (
                            <span
                              className={`font-body-sm text-body-sm mt-0.5 ${
                                isPaused
                                  ? "text-tertiary font-medium"
                                  : isUnavailable
                                  ? "text-outline"
                                  : "text-on-surface-variant"
                              }`}
                            >
                              {counter.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Currently Serving */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-start gap-space-md">
                        <span
                          className={`md:hidden font-label-ui text-label-ui uppercase tracking-wider ${
                            isUnavailable ? "text-outline" : "text-on-surface-variant"
                          }`}
                        >
                          Currently Serving:
                        </span>
                        <div className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/20 inline-flex items-center min-w-[70px] justify-center">
                          <span
                            className={`font-label-token-md text-label-token-md font-bold ${
                              isActive && !isPaused
                                ? "text-primary"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {counter.currentToken || "—"}
                          </span>
                        </div>
                      </div>

                      {/* Queue Velocity */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-start gap-space-md">
                        <span
                          className={`md:hidden font-label-ui text-label-ui uppercase tracking-wider ${
                            isUnavailable ? "text-outline" : "text-on-surface-variant"
                          }`}
                        >
                          Queue Velocity:
                        </span>
                        <div className="flex flex-col">
                          <span
                            className={`font-headline-sm text-headline-sm font-bold ${
                              isActive && !isPaused
                                ? "text-on-surface"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {counter.waitingCount || 0} {counter.waitingCount === 1 ? 'person' : 'people'}
                          </span>
                          <span
                            className={`font-body-sm text-body-sm ${
                              isUnavailable ? "text-outline" : "text-on-surface-variant"
                            }`}
                          >
                            Est. Wait:{" "}
                            <span className="font-semibold text-on-surface">
                              {counter.estimatedWait || "0 mins"}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Operational State */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-start">
                        <span
                          className={`md:hidden font-label-ui text-label-ui uppercase tracking-wider ${
                            isUnavailable ? "text-outline" : "text-on-surface-variant"
                          }`}
                        >
                          Operational State:
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-ui text-[12px] uppercase font-bold tracking-wider ${
                            isActive && !isPaused
                              ? "bg-secondary-container/60 text-secondary border border-secondary/20"
                              : isPaused
                              ? "bg-tertiary-fixed/60 text-tertiary border border-tertiary/20"
                              : "bg-surface-container text-outline border border-outline-variant/30"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive && !isPaused
                                ? "bg-secondary shadow-[0_0_6px_rgba(var(--color-secondary),0.6)]"
                                : isPaused
                                ? "bg-tertiary"
                                : "bg-outline"
                            }`}
                          ></span>
                          {isActive && !isPaused ? "Active" : isPaused ? "Queue Paused" : "Unavailable"}
                        </span>
                      </div>

                      {/* Action Trigger */}
                      <div className="md:col-span-2 flex items-center justify-end">
                        {isActive && !isPaused ? (
                          <button
                            onClick={() => handleGetTokenClick(counter)}
                            className="w-full md:w-auto px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-ui text-label-ui uppercase tracking-wider hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm flex items-center justify-center gap-1.5 font-bold active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              add_circle
                            </span>
                            Get Token
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full md:w-auto px-space-md py-2.5 rounded-xl bg-surface-container-high text-outline font-label-ui text-label-ui uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-1.5 opacity-70"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isPaused ? "lock" : "block"}
                            </span>
                            {isPaused ? "Queue Paused" : "Unavailable"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Live Dispatch Metrics & Floor Map Section */}
          <section className="w-full max-w-7xl mx-auto px-margin pb-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-stretch">
              {/* Hub Service Distribution Chart Card */}
              <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                    <div>
                      <span className="font-label-ui text-label-ui uppercase tracking-wider text-primary">
                        Throughput Graph
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        Operational Desk Flow Speed
                      </h3>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Tokens / Hour
                    </span>
                  </div>
                  {/* Semantic SVG Vector Chart */}
                  <div className="w-full h-44 my-space-md flex items-end">
                    <svg
                      className="w-full h-full overflow-visible text-primary"
                      preserveAspectRatio="none"
                      viewBox="0 0 500 120"
                    >
                      {/* Grid rules */}
                      <line
                        stroke="#dae2fd"
                        strokeDasharray="3,3"
                        strokeWidth="1"
                        x1="0"
                        x2="500"
                        y1="20"
                        y2="20"
                      ></line>
                      <line
                        stroke="#dae2fd"
                        strokeDasharray="3,3"
                        strokeWidth="1"
                        x1="0"
                        x2="500"
                        y1="60"
                        y2="60"
                      ></line>
                      <line
                        stroke="#dae2fd"
                        strokeWidth="1"
                        x1="0"
                        x2="500"
                        y1="100"
                        y2="100"
                      ></line>
                      {/* Smooth path */}
                      <path
                        d="M0,90 Q 60,30 120,55 T 240,40 T 360,75 T 500,20 L 500,120 L 0,120 Z"
                        fill="#dce1ff"
                        opacity="0.65"
                      ></path>
                      <path
                        d="M0,90 Q 60,30 120,55 T 240,40 T 360,75 T 500,20"
                        fill="none"
                        stroke="#1d4ed8"
                        strokeWidth="2.5"
                      ></path>
                      {/* Data nodes */}
                      <circle cx="120" cy="55" fill="#0037b0" r="4"></circle>
                      <circle cx="240" cy="40" fill="#0037b0" r="4"></circle>
                      <circle cx="360" cy="75" fill="#0037b0" r="4"></circle>
                      <circle cx="500" cy="20" fill="#006e2d" r="4"></circle>
                    </svg>
                  </div>
                  <div className="flex items-center justify-between font-label-token-sm text-label-token-sm text-on-surface-variant pt-space-xs">
                    <span>08:00 AM (Open)</span>
                    <span>10:30 AM (Peak Intake)</span>
                    <span>12:00 PM</span>
                    <span>02:30 PM (Current)</span>
                  </div>
                </div>
                <div className="mt-space-md pt-space-sm flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low p-space-sm rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Peak Service Efficiency: <strong>94.2%</strong>
                    </span>
                  </div>
                  <span className="font-label-ui text-label-ui text-on-surface-variant">
                    Standard deviation ± 2.1m
                  </span>
                </div>
              </div>

              {/* Facility Zone Locator */}
              <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <div>
                      <span className="font-label-ui text-label-ui uppercase tracking-wider text-primary">
                        Terminal Locator
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        Station Directory
                      </h3>
                    </div>
                    <span className="font-label-token-sm text-label-token-sm px-2 py-0.5 rounded bg-surface-container text-on-surface">
                      LEVEL G
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    All counters operate with assistive audio chimes and overhead
                    synchronized LED numeric indicators.
                  </p>
                  <div className="w-full h-40 rounded-lg overflow-hidden relative mb-space-md">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuW-qBqAxC9bRMxMYoiypdNAXtUctvpT7-PvFUGv5fO-Kt2P5cBNkmICLIeqRpe3VfNvBbdLg9LRZ1FvkLxaBWHRsOtXVdtGWZWt3eW5zeNCg6EIiqDMrd3hAX1ZImqKmYfWqBiqI26ECevJQxpzFwiXpAcCLrFEVAdglpGqYdcPypio8ASG7DU7NTXCeTpnbtc5QxLtkHW7Kp5uaIkot2ctQmutWWoN2stxYoB4idt6ef1iG6XQPC"
                      alt="Overhead architectural blueprint and minimalist navigation map diagram..."
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-inverse-surface/80 text-inverse-on-surface font-label-token-sm text-label-token-sm px-2 py-1 rounded">
                      SECTOR NORTH
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="p-space-xs px-space-sm rounded bg-surface-container-low">
                    <span className="font-label-ui text-label-ui text-on-surface-variant block uppercase">
                      ADA Compliance
                    </span>
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                      Desks 1 & 3 Equipped
                    </span>
                  </div>
                  <div className="p-space-xs px-space-sm rounded bg-surface-container-low">
                    <span className="font-label-ui text-label-ui text-on-surface-variant block uppercase">
                      Paging Band
                    </span>
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                      868 MHz Ch. 04
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Instant Token Modal (Interactive Dialogue Layer) */}
        {isModalOpen && modalData && (
          <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-space-md">
            <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl p-space-lg">
              <div className="flex items-center justify-between pb-space-sm mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      confirmation_number
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">
                      Issue Digital Token
                    </h4>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {modalData.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="space-y-space-md">
                <div className="p-space-md bg-surface-container-low rounded-lg flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-ui text-label-ui text-on-surface-variant uppercase">
                      Queue Target Prefix
                    </span>
                    <span className="font-label-token-lg text-label-token-lg text-primary">
                      Prefix {modalData.prefix}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-ui text-label-ui text-on-surface-variant uppercase block">
                      Est. Wait
                    </span>
                    <span className="font-label-token-md text-label-token-md text-on-surface">
                      ~15 mins
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    className="font-label-ui text-label-ui text-on-surface uppercase"
                    htmlFor="modal-client-phone"
                  >
                    Mobile Phone for SMS Alert (Optional)
                  </label>
                  <input
                    id="modal-client-phone"
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-lg focus:outline-none focus:bg-surface-container-lowest"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    You will receive a silent ping when 2 patients remain ahead.
                  </span>
                </div>
                <div className="pt-space-sm flex flex-col gap-space-xs">
                  <button
                    onClick={handleConfirmToken}
                    className="w-full py-3 rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:bg-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      check_circle
                    </span>
                    Generate Token Now
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="w-full py-2 rounded-lg bg-transparent text-on-surface-variant font-label-ui text-label-ui hover:bg-surface-container-low"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading application...</div>}>
      <HomeContent />
    </Suspense>
  );
}
