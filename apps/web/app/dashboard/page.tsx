"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useGetMeQuery } from "../../store/api/authApi";
import { 
  useGetCurrentCustomerTokenQuery, 
  useGetCustomerHistoryQuery, 
  useGenerateTokenMutation, 
  useCancelTokenMutation 
} from "../../store/api/tokenApi";
import { useGetCountersQuery } from "../../store/api/counterApi";

export default function CustomerDashboard() {
  const router = useRouter();
  const { data: userResponse, isLoading: isAuthLoading, isError: isAuthError } = useGetMeQuery(undefined);
  const user = userResponse?.user || userResponse?.data;
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!isAuthLoading && (isAuthError || !isAuthenticated)) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthError, isAuthenticated, router]);

  const { data: currentTokenRes, isLoading: isTokenLoading, refetch: refetchToken } = useGetCurrentCustomerTokenQuery(undefined, {
    skip: !isAuthenticated,
  });
  const activeToken = currentTokenRes?.data;

  const { data: historyRes } = useGetCustomerHistoryQuery(undefined, {
    skip: !isAuthenticated,
  });
  const history = historyRes?.data || [];

  const { data: countersRes, isLoading: isCountersLoading } = useGetCountersQuery(undefined);
  const counters = countersRes?.data || [];

  const [generateToken] = useGenerateTokenMutation();
  const [cancelToken] = useCancelTokenMutation();

  const [notifActive, setNotifActive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const cfg = activeToken ? {
    statusText: activeToken.status === "SERVING" ? "SERVING NOW" : "WAITING",
    badgeBg: activeToken.status === "SERVING" ? "bg-secondary-fixed" : "bg-tertiary-fixed",
    badgeText: activeToken.status === "SERVING" ? "text-secondary" : "text-tertiary",
    dotBg: activeToken.status === "SERVING" ? "bg-secondary" : "bg-tertiary",
    showCallout: activeToken.status === "SERVING",
    pos: activeToken.status === "SERVING" ? "1" : (activeToken.peopleAhead + 1).toString(),
    ahead: activeToken.peopleAhead.toString(),
    wait: activeToken.estimatedWait.replace(" mins", ""),
    progress: activeToken.status === "SERVING" ? "100%" : "50%",
  } : null;

  const handleCancelToken = async () => {
    if (!activeToken) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await cancelToken(activeToken.id).unwrap();
      setActionSuccess("Token cancelled successfully.");
    } catch (err: any) {
      setActionError(err?.data?.message || "Failed to cancel token");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchToken();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleGetToken = async (counterId: string, name: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await generateToken({ counterId }).unwrap();
      setActionSuccess(`Queue token successfully reserved for ${name}.`);
    } catch (err: any) {
      setActionError(err?.data?.message || "Failed to get token");
    }
  };

  const scrollToCounters = () => {
    const el = document.getElementById("available-counters");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Header />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-7xl mx-auto px-margin py-space-lg flex flex-col gap-space-xl">
            {actionError && (
              <div className="p-space-md bg-error-container rounded-lg flex items-center justify-between text-on-error-container">
                <span className="font-body-md text-body-md font-semibold">{actionError}</span>
                <button onClick={() => setActionError(null)} className="text-on-error-container font-bold">✕</button>
              </div>
            )}
            {actionSuccess && (
              <div className="p-space-md bg-secondary-fixed text-secondary rounded-lg flex items-center justify-between">
                <span className="font-body-md text-body-md font-semibold">{actionSuccess}</span>
                <button onClick={() => setActionSuccess(null)} className="font-bold">✕</button>
              </div>
            )}
            {/* Header / Welcome Banner */}
            <div className="relative overflow-hidden rounded-xl bg-surface-container-low shadow-sm p-space-lg md:p-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs z-10">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high font-label-ui text-label-ui uppercase tracking-wider text-primary">
                    Live Session
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>{" "}
                    Terminal Node #04
                  </span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Good morning, {user?.name || "Customer"}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                  Track your active queue in real time and explore available service
                  counters with automated flow balancing.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm z-10">
                <button
                  onClick={scrollToCounters}
                  className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary font-label-ui text-label-ui uppercase tracking-wider hover:bg-primary transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add_circle
                  </span>
                  Get New Token
                </button>
                <button
                  onClick={() => setNotifActive(!notifActive)}
                  className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface font-label-ui text-label-ui uppercase tracking-wider hover:bg-surface-container-high transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-secondary text-[18px]">
                    {notifActive ? "notifications_active" : "notifications_off"}
                  </span>
                  <span>{notifActive ? "SMS Alerts Active" : "Alerts Muted"}</span>
                </button>
              </div>
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary-fixed/25 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* PRIMARY SECTION: Hero Operational Token Card */}
            {activeToken && cfg ? (
              <div className="flex flex-col gap-space-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary-container text-[22px]">
                      confirmation_number
                    </span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      Active Queue Token
                    </h2>
                  </div>
                </div>

                {/* Main Operational Unit */}
                <div className="rounded-xl bg-surface-container-lowest shadow-md overflow-hidden transition-all duration-300">
                  {/* Live Notification Bar for Serving state */}
                  {cfg.showCallout && (
                    <div className="bg-secondary px-space-md py-space-sm text-on-secondary flex items-center justify-between gap-space-md animate-pulse">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[20px]">
                          campaign
                        </span>
                        <span className="font-headline-sm text-headline-sm">
                          IT'S YOUR TURN! Please proceed immediately to the counter.
                        </span>
                      </div>
                      <span className="font-label-ui text-label-ui uppercase bg-on-secondary/20 px-space-xs py-0.5 rounded">
                        Priority Handoff
                      </span>
                    </div>
                  )}
                  
                  <div className="p-space-lg md:p-space-xl flex flex-col gap-space-lg">
                    {/* Card Header Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div className="flex items-start md:items-center gap-space-md">
                        <div className="px-space-md py-space-sm rounded-lg bg-surface-container flex flex-col items-center justify-center">
                          <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wider">
                            Ticket
                          </span>
                          <span className="font-label-token-lg text-label-token-lg text-primary tracking-tighter">
                            {activeToken.tokenNumber}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-headline-md text-headline-md text-on-surface">
                              {activeToken.counter?.name || "Counter"}
                            </span>
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Issued today
                          </span>
                        </div>
                      </div>
                    {/* Dynamic State Badge */}
                    <div
                      className={`self-start md:self-center flex items-center gap-space-xs px-space-md py-1.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${cfg.dotBg} animate-ping`}
                      ></span>
                      <span className="font-label-ui text-label-ui uppercase tracking-wider font-semibold">
                        {cfg.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Live Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm">
                    <div className="rounded-lg bg-surface-container-low p-space-md flex flex-col justify-between">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Queue Position
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-label-token-lg text-label-token-lg text-on-surface">
                          {cfg.pos}
                        </span>
                        {cfg.pos !== "-" && !isNaN(Number(cfg.pos)) && (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            th
                          </span>
                        )}
                      </div>
                      <span className="font-label-ui text-label-ui text-secondary-container-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_downward
                        </span>{" "}
                        High Velocity
                      </span>
                    </div>
                    <div className="rounded-lg bg-surface-container-low p-space-md flex flex-col justify-between">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        People Ahead
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-headline-lg text-headline-lg text-on-surface">
                          {cfg.ahead}
                        </span>
                        {cfg.ahead !== "-" && (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            people
                          </span>
                        )}
                      </div>
                      <span className="font-label-ui text-label-ui text-on-surface-variant mt-1">
                        Optimal grouping
                      </span>
                    </div>
                      {(() => {
                        const activeCounter = counters.find((c: any) => c.id === activeToken.counterId);
                        return (
                          <div className="rounded-lg bg-surface-container-low p-space-md flex flex-col justify-between">
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              Currently Serving
                            </span>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="font-label-token-md text-label-token-md text-primary">
                                {activeCounter?.currentToken || "—"}
                              </span>
                            </div>
                            <span className="font-label-ui text-label-ui text-on-surface-variant mt-1">
                              {activeCounter ? `${activeCounter.name}` : "Live Status"}
                            </span>
                          </div>
                        );
                      })()}
                    <div className="rounded-lg bg-surface-container-low p-space-md flex flex-col justify-between">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Estimated Wait
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-headline-lg text-headline-lg text-tertiary">
                          {cfg.wait}
                        </span>
                        {cfg.wait !== "-" && cfg.wait !== "Next Cycle" && (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            min
                          </span>
                        )}
                      </div>
                      <span className="font-label-ui text-label-ui text-on-surface-variant mt-1">
                        Based on avg speed
                      </span>
                    </div>
                      <div className="col-span-2 sm:col-span-1 rounded-lg bg-surface-container-low p-space-md flex flex-col justify-between">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Counter Assigned
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="font-headline-sm text-headline-sm text-on-surface">
                            {activeToken.counter?.prefix || "N/A"}
                          </span>
                        </div>
                        <span className="font-label-ui text-label-ui text-on-surface-variant mt-1">
                          {activeToken.counter?.name}
                        </span>
                      </div>
                  </div>

                  {/* Queue Progress Linear Flow */}
                  <div className="flex flex-col gap-space-xs pt-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-label-ui text-label-ui uppercase tracking-wider text-on-surface-variant">
                        Live Dispatch Pipeline
                      </span>
                      <span className="font-body-sm text-body-sm text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          sync
                        </span>{" "}
                        Synced Live
                      </span>
                    </div>
                    {/* Pipeline Visual Nodes */}
                    <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-sm">
                      {(() => {
                        const activeCounter = counters.find((c: any) => c.id === activeToken.counterId);
                        const servingTokenNum = activeCounter?.currentToken || "—";
                        const prefix = activeToken.counter?.prefix || "T";
                        const currentSeq = activeToken.sequenceNumber || 1;
                        
                        // Calculate preceding ticket sequences dynamically
                        const seq1 = Math.max(1, currentSeq - 3);
                        const seq2 = Math.max(1, currentSeq - 2);
                        const seq3 = Math.max(1, currentSeq - 1);

                        return (
                          <div className="flex items-center justify-between overflow-x-auto py-space-xs gap-space-sm">
                            {/* Node 1 (Serving) */}
                            <div className="flex flex-col items-center gap-1 min-w-[72px]">
                              <span className="font-label-ui text-label-ui text-secondary uppercase font-semibold">
                                Serving
                              </span>
                              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-secondary text-[20px]">
                                  person
                                </span>
                              </div>
                              <span className="font-label-token-sm text-label-token-sm text-on-surface font-semibold">
                                {servingTokenNum}
                              </span>
                            </div>
                            <div className="flex-1 h-0.5 bg-surface-container-highest min-w-[24px]"></div>
                            {/* Node 2 */}
                            <div className="flex flex-col items-center gap-1 min-w-[72px]">
                              <span className="font-label-ui text-label-ui text-on-surface-variant uppercase">
                                Queue
                              </span>
                              <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
                                <span className="font-label-token-sm text-label-token-sm">
                                  {seq1}
                                </span>
                              </div>
                              <span className="font-label-token-sm text-label-token-sm text-on-surface-variant">
                                {prefix}-{String(seq1).padStart(3, "0")}
                              </span>
                            </div>
                            <div className="flex-1 h-0.5 bg-surface-container-highest min-w-[24px]"></div>
                            {/* Node 3 */}
                            <div className="flex flex-col items-center gap-1 min-w-[72px]">
                              <span className="font-label-ui text-label-ui text-on-surface-variant uppercase">
                                Queue
                              </span>
                              <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
                                <span className="font-label-token-sm text-label-token-sm">
                                  {seq2}
                                </span>
                              </div>
                              <span className="font-label-token-sm text-label-token-sm text-on-surface-variant">
                                {prefix}-{String(seq2).padStart(3, "0")}
                              </span>
                            </div>
                            <div className="flex-1 h-0.5 bg-surface-container-highest min-w-[24px]"></div>
                            {/* Node 4 */}
                            <div className="flex flex-col items-center gap-1 min-w-[72px]">
                              <span className="font-label-ui text-label-ui text-on-surface-variant uppercase">
                                Queue
                              </span>
                              <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface-variant">
                                <span className="font-label-token-sm text-label-token-sm">
                                  {seq3}
                                </span>
                              </div>
                              <span className="font-label-token-sm text-label-token-sm text-on-surface-variant">
                                {prefix}-{String(seq3).padStart(3, "0")}
                              </span>
                            </div>
                            <div className="flex-1 h-0.5 bg-primary min-w-[24px]"></div>
                            {/* Node 5 (YOU) */}
                            <div className="flex flex-col items-center gap-1 min-w-[90px]">
                              <span className="font-label-ui text-label-ui text-primary uppercase font-bold">
                                {activeToken.status === "SERVING" ? "Your Turn!" : "You"}
                              </span>
                              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-[20px]">
                                  how_to_reg
                                </span>
                              </div>
                              <span className="font-label-token-sm text-label-token-sm text-primary font-bold">
                                {activeToken.tokenNumber}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Visual progress indicator */}
                      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mt-4">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: cfg.progress }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <button
                        onClick={handleRefresh}
                        className={`flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary font-label-ui text-label-ui uppercase tracking-wider hover:bg-primary transition-all shadow-sm ${
                          isRefreshing ? "opacity-75" : ""
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? "animate-spin" : ""}`}>
                          refresh
                        </span>
                        Track Queue (Live Refresh)
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={handleCancelToken}
                        className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-error-container text-on-error-container font-label-ui text-label-ui uppercase tracking-wider hover:bg-error hover:text-on-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          cancel
                        </span>
                        Cancel Token
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ) : (
              <div className="rounded-xl bg-surface-container-lowest p-space-xl flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-space-md">
                  <span className="material-symbols-outlined text-[32px]">event_seat</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No Active Token</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  You don't have any active queue tokens. Scroll down to view available service counters and generate one.
                </p>
                <button
                  onClick={scrollToCounters}
                  className="mt-space-md flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-ui text-label-ui uppercase tracking-wider hover:bg-primary-container transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_downward
                  </span>
                  View Counters
                </button>
              </div>
            )}

            {/* SECTION 2: Customer Counters (Get Token for Other Desks) */}
            <div id="available-counters" className="flex flex-col gap-space-lg mt-6 bg-surface-container-lowest p-space-xl rounded-[2rem] shadow-sm border border-outline-variant/20 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md relative z-10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-[28px]">
                      support_agent
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                      Available Service Counters
                    </h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                    Select a desk below to instantly generate your queue token. Real-time waiting counts are displayed to help you choose the fastest service.
                  </p>
                </div>
                <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-xl border border-outline-variant/30 font-label-ui text-label-ui">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                    </span>
                    <span className="text-on-surface font-medium">{counters.filter((c: any) => c.isActive && !c.isPaused).length} Open</span>
                  </div>
                  <span className="text-outline-variant mx-1">|</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <span className="text-on-surface-variant">{counters.filter((c: any) => c.isPaused).length} Paused</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-xl relative z-10">
                {counters.map((counter: any) => (
                  <div key={counter.id} className={`group rounded-3xl p-6 min-h-[280px] flex flex-col justify-between gap-space-md border transition-all duration-300 ${counter.isActive && !counter.isPaused ? "bg-surface border-outline-variant/30 hover:border-primary/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1.5" : "bg-surface-container-low border-transparent opacity-80"}`}>
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-space-sm py-1.5 rounded-lg bg-surface-container-high font-label-token-md text-label-token-md text-on-surface font-bold tracking-widest shadow-sm border border-outline-variant/10">
                          {counter.prefix}
                        </span>
                        {counter.isActive && !counter.isPaused ? (
                          <span className="flex items-center gap-1.5 font-label-ui text-[12px] uppercase tracking-wider text-secondary font-bold">
                            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(var(--color-secondary),0.6)]"></span> OPEN
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 font-label-ui text-[12px] uppercase tracking-wider text-error font-bold bg-error-container/50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> PAUSED
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface leading-tight">
                        {counter.name}
                      </h3>
                      {counter.description && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {counter.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex justify-between items-center bg-surface-container-low px-space-md py-space-sm rounded-xl border border-outline-variant/20">
                        <span className="font-label-ui text-label-ui text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">groups</span>
                          Waiting
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          {counter.waitingCount || 0}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleGetToken(counter.id, counter.name)}
                        disabled={!counter.isActive || counter.isPaused}
                        className={`w-full py-3.5 rounded-xl font-label-ui text-label-ui uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                          counter.isActive && !counter.isPaused
                            ? "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container hover:shadow-md active:scale-[0.98]"
                            : "bg-surface-container-high text-outline cursor-not-allowed"
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[20px] ${counter.isActive && !counter.isPaused ? "group-hover:rotate-90 transition-transform duration-300" : ""}`}>
                          {!counter.isActive || counter.isPaused ? "block" : "add"}
                        </span>
                        {counter.isActive && !counter.isPaused ? "Get Token" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: Recent Token History & Empty State Demo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
              {/* History Table */}
              <div className="lg:col-span-2 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      history
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Recent Token History
                    </h3>
                  </div>
                  <a
                    href="#"
                    className="font-label-ui text-label-ui text-primary uppercase tracking-wider hover:underline flex items-center gap-1"
                  >
                    View Full History
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </a>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-ui text-label-ui uppercase tracking-wider">
                        <th className="py-space-xs px-space-sm rounded-l">Token ID</th>
                        <th className="py-space-xs px-space-sm">Service Counter</th>
                        <th className="py-space-xs px-space-sm">Timestamp</th>
                        <th className="py-space-xs px-space-sm rounded-r">
                          Final Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-0 font-body-md text-body-md">
                      {history.map((item: any) => (
                        <tr key={item.token.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-space-sm px-space-sm font-label-token-sm text-label-token-sm font-bold text-on-surface">
                            {item.token.tokenNumber}
                          </td>
                          <td className="py-space-sm px-space-sm text-on-surface">
                            {item.counter?.name || "Counter"}
                          </td>
                          <td className="py-space-sm px-space-sm text-on-surface-variant">
                            {new Date(item.token.createdAt).toLocaleString()}
                          </td>
                          <td className="py-space-sm px-space-sm">
                            <span
                              className={`inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full font-label-ui text-label-ui uppercase font-semibold
                                ${
                                  item.token.status === "COMPLETED"
                                    ? "bg-secondary-fixed text-secondary"
                                    : item.token.status === "CANCELLED"
                                    ? "bg-error-container text-on-error-container"
                                    : "bg-tertiary-fixed text-tertiary"
                                }
                              `}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.token.status === "COMPLETED"
                                    ? "bg-secondary"
                                    : item.token.status === "CANCELLED"
                                    ? "bg-error"
                                    : "bg-tertiary"
                                }`}
                              ></span>{" "}
                              {item.token.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-space-md text-center text-on-surface-variant font-body-sm">
                            No recent token history.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="pt-space-xs flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                  <span>Showing {history.length} historical dispatches</span>
                  <span className="flex items-center gap-1">
                    Audit log verified{" "}
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      verified
                    </span>
                  </span>
                </div>
              </div>

              {/* Empty State / Secondary Facility Card */}
              <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Linked Passbook
                  </h3>
                  <span className="font-label-ui text-label-ui text-on-surface-variant uppercase">
                    Facility 02
                  </span>
                </div>
                {/* Empty State Graphics */}
                <div className="my-space-md py-space-lg px-space-sm rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center gap-space-xs">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[26px]">inbox</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    No Secondary Queue
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                    You currently hold no concurrent tokens at South Satellite or Satellite
                    Annex desks.
                  </p>
                  <button className="mt-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-highest text-primary font-label-ui text-label-ui uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors">
                    Scan QR Check-In
                  </button>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      pin_drop
                    </span>{" "}
                    South Campus
                  </span>
                  <span className="text-secondary font-semibold">Network Online</span>
                </div>
              </div>
            </div>

            {/* Facility Floor Plan Visual Banner */}
            <div className="rounded-xl bg-surface-container-lowest p-space-md md:p-space-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">map</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Need Navigation Assistance?
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Access the real-time interior route to Desk 01 — West Wing from
                    current waiting lounge.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs w-full md:w-auto justify-end">
                <button className="px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface font-label-ui text-label-ui uppercase tracking-wider hover:bg-surface-container transition-colors">
                  View Digital Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
