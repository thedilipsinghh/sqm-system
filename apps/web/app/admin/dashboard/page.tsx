"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminHeader from "../../../components/AdminHeader";
import { 
  useGetCountersQuery, 
  usePauseCounterMutation, 
  useResumeCounterMutation,
  useCreateCounterMutation,
  useUpdateCounterMutation,
  useDeleteCounterMutation,
  useActivateCounterMutation,
  useDeactivateCounterMutation
} from "../../../store/api/counterApi";
import { useCallNextTokenMutation, useCompleteTokenMutation, useSkipTokenMutation } from "../../../store/api/tokenApi";
import { useGetDashboardStatsQuery } from "../../../store/api/dashboardApi";
import { useGetMeQuery } from "../../../store/api/authApi";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: userResponse, isLoading: isUserLoading, isError: isUserError } = useGetMeQuery(undefined);
  
  useEffect(() => {
    const role = userResponse?.user?.role || userResponse?.data?.role;
    if (!isUserLoading && (isUserError || role !== "ADMIN")) {
      router.push("/login");
    }
  }, [isUserLoading, isUserError, userResponse, router]);

  const [syncSeconds, setSyncSeconds] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCounter, setNewCounter] = useState({ name: "", prefix: "", description: "" });

  const { data: countersRes, isLoading: isCountersLoading } = useGetCountersQuery(undefined, { pollingInterval: 2000 });
  const queues = countersRes?.data || [];

  const { data: statsRes } = useGetDashboardStatsQuery(undefined, { pollingInterval: 5000 });
  const stats = statsRes?.data || {
    totalCounters: 0,
    activeCounters: 0,
    tokensToday: 0,
    waiting: 0,
    serving: 0,
    completed: 0,
    skipped: 0,
  };
  
  const pausedCountersCount = queues.filter((q: any) => q.isPaused).length;

  const [callNextToken] = useCallNextTokenMutation();
  const [completeToken] = useCompleteTokenMutation();
  const [skipToken] = useSkipTokenMutation();
  const [pauseCounter] = usePauseCounterMutation();
  const [resumeCounter] = useResumeCounterMutation();
  const [createCounter] = useCreateCounterMutation();
  const [updateCounter] = useUpdateCounterMutation();
  const [deleteCounter] = useDeleteCounterMutation();
  const [activateCounter] = useActivateCounterMutation();
  const [deactivateCounter] = useDeactivateCounterMutation();

  // Sync Timer Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncSeconds((prev) => (prev >= 10 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async (counterId: string) => {
    try {
      await callNextToken(counterId).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to call next token");
    }
  };

  const handleCompleteToken = async (tokenId: string) => {
    try {
      await completeToken(tokenId).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to complete token");
    }
  };

  const handleSkipToken = async (tokenId: string) => {
    if (confirm("Are you sure you want to skip this token?")) {
      try {
        await skipToken(tokenId).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || "Failed to skip token");
      }
    }
  };

  const handleTogglePause = async (counter: any) => {
    try {
      if (counter.isPaused) {
        await resumeCounter(counter.id).unwrap();
      } else {
        await pauseCounter(counter.id).unwrap();
      }
    } catch (err: any) {
      alert("Failed to toggle counter state");
    }
  };

  const handlePauseAll = () => {
    if (
      window.confirm(
        "EMERGENCY ACTION: Are you sure you want to pause all active queues?"
      )
    ) {
      alert("All queues paused.");
    }
  };

  const handleToggleActive = async (counter: any) => {
    try {
      if (counter.isActive) {
        if (confirm("Are you sure you want to deactivate this counter? It will no longer accept new tokens.")) {
          await deactivateCounter(counter.id).unwrap();
        }
      } else {
        await activateCounter(counter.id).unwrap();
      }
    } catch (err: any) {
      alert("Failed to toggle counter active state");
    }
  };

  const handleDeleteCounter = async (id: string) => {
    if (confirm("Are you sure you want to delete this counter? This action cannot be undone.")) {
      try {
        await deleteCounter(id).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || "Failed to delete counter. Ensure it has no associated tokens.");
      }
    }
  };

  const handleSaveCounter = async () => {
    if (!newCounter.name || !newCounter.prefix) {
      alert("Name and prefix are required");
      return;
    }
    try {
      await createCounter(newCounter).unwrap();
      setIsModalOpen(false);
      setNewCounter({ name: "", prefix: "", description: "" });
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create counter");
    }
  };

  return (
    <>
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader />
        <main className="relative pt-16 w-full px-margin bg-surface">
          <div className="flex flex-col w-full">
            <div className="py-space-md flex flex-col gap-space-lg">
              {/* Header Details */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-ui text-label-ui">
                    <span>Operations</span>
                    <span className="material-symbols-outlined text-[14px]">
                      chevron_right
                    </span>
                    <span className="text-primary font-semibold">
                      Real-Time Queue Monitor
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm flex-wrap mt-0.5">
                    <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        local_hospital
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Central City Hospital & Medical Center - Main Clinic
                      </span>
                    </div>
                    <span className="font-label-token-sm text-label-token-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      LOC-ID #4092
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm flex-wrap">
                  <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      tune
                    </span>
                    <span className="font-label-ui text-label-ui font-medium">
                      All Counters (12)
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1.5 rounded-lg text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      schedule
                    </span>
                    <span className="font-label-ui text-label-ui">
                      Morning Shift (08:00 - 16:00)
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-high text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    <span className="font-label-ui text-label-ui text-on-surface-variant">
                      Live Feed Active • Last updated{" "}
                      <span className="font-semibold text-on-surface">
                        {syncSeconds}s ago
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md">
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-outline mb-space-xs">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider">
                      Total Desks
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      desktop_windows
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-label-token-lg text-label-token-lg text-on-surface font-bold">
                      {stats.totalCounters}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Registered
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-primary h-full w-full"></div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary mb-space-xs">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider text-outline">
                      Active Now
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      sensors
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-label-token-lg text-label-token-lg text-secondary font-bold">
                      {stats.activeCounters}
                    </span>
                    <span className="font-body-sm text-body-sm text-error">
                      {pausedCountersCount} paused
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-outline mb-space-xs">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider">
                      Waiting Queue
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      hourglass_top
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-label-token-lg text-label-token-lg text-on-surface font-bold">
                      {stats.waiting}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-tertiary-container h-full"
                      style={{ width: "58%" }}
                    ></div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-primary mb-space-xs">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider text-outline">
                      In Service
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      assignment_turned_in
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-label-token-lg text-label-token-lg text-primary font-bold">
                      {stats.serving}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Parallel
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-primary-container h-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-outline mb-space-xs">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider">
                      Daily Volume
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      confirmation_number
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-label-token-lg text-label-token-lg text-on-surface font-bold">
                      {stats.tokensToday}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-surface-dim h-full" style={{ width: "82%" }}></div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-outline mb-space-xs">
                    <span className="font-label-ui text-label-ui uppercase tracking-wider">
                      Completed
                    </span>
                    <span className="material-symbols-outlined text-[18px]">timer</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-label-token-lg text-label-token-lg text-on-surface font-bold">
                      {stats.completed}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-secondary-fixed-dim h-full"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-ui text-label-ui shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      add_circle
                    </span>
                    <span>Add New Counter</span>
                  </button>
                  <button className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors font-label-ui text-label-ui">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      campaign
                    </span>
                    <span>Broadcast Announcement</span>
                  </button>
                  <button className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors font-label-ui text-label-ui">
                    <span className="material-symbols-outlined text-[18px] text-outline">
                      download
                    </span>
                    <span>Export CSV Log</span>
                  </button>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={handlePauseAll}
                    className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors font-label-ui text-label-ui"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      pause_circle
                    </span>
                    <span>Emergency Pause All</span>
                  </button>
                </div>
              </div>

              {/* Main Content Sections */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
                <div className="xl:col-span-12 flex flex-col gap-space-md">
                  {/* Table Section */}
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-space-md bg-surface-container-low flex items-center justify-between flex-wrap gap-space-sm">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          view_timeline
                        </span>
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                          Live Counter Dispatch Terminal
                        </h2>
                        <span className="font-label-ui text-label-ui px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                          Real-Time Sync: WebSocket ON
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs text-body-sm text-outline">
                        <span>Auto-refresh</span>
                        <div className="w-8 h-4 bg-secondary rounded-full p-0.5 flex justify-end cursor-pointer">
                          <div className="w-3 h-3 rounded-full bg-on-secondary"></div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface-container-low/50 text-on-surface-variant font-label-ui text-[11px] uppercase tracking-wider">
                            <th className="py-space-sm px-space-md">Counter & Dept</th>
                            <th className="py-space-sm px-space-md">
                              Prefix & Operator
                            </th>
                            <th className="py-space-sm px-space-md">Status</th>
                            <th className="py-space-sm px-space-md">Now Serving</th>
                            <th className="py-space-sm px-space-md">Waiting</th>
                            <th className="py-space-sm px-space-md">Est. Wait</th>
                            <th className="py-space-sm px-space-md text-right">
                              Quick Controls
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
                          {queues.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-space-xl px-space-md text-center text-on-surface-variant font-label-ui">
                                {isCountersLoading ? "Loading service counters..." : "No active service counters found. Click 'Add New Counter' to provision one."}
                              </td>
                            </tr>
                          ) : queues.map((q: any) => (
                            <tr
                              key={q.id}
                              className={`hover:bg-surface-container-low/30 transition-colors ${
                                !q.isActive ? "opacity-60" : ""
                              } ${
                                q.isPaused
                                  ? "bg-surface-container-low/10"
                                  : ""
                              }`}
                            >
                              <td className="py-space-md px-space-md">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-on-surface">
                                    {q.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-space-md px-space-md">
                                <div className="flex items-center gap-space-xs">
                                  <span
                                    className={`font-label-token-sm text-label-token-sm px-1.5 py-0.5 rounded bg-surface-container font-bold ${
                                      q.isPaused || !q.isActive
                                        ? "text-outline"
                                        : "text-primary"
                                    }`}
                                  >
                                    {q.prefix}
                                  </span>
                                </div>
                              </td>
                              <td className="py-space-md px-space-md">
                                {q.isActive && !q.isPaused && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-ui text-label-ui">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                    Active
                                  </span>
                                )}
                                {q.isPaused && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-ui text-label-ui">
                                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                                    Paused
                                  </span>
                                )}
                                {!q.isActive && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-outline font-label-ui text-label-ui">
                                    <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="py-space-md px-space-md">
                                {q.currentToken !== "—" ? (
                                  <span className="font-label-token-md text-label-token-md bg-surface-container-low px-2 py-1 rounded text-primary font-bold">
                                    {q.currentToken}
                                  </span>
                                ) : (
                                  <span className="font-label-token-md text-label-token-md text-outline">
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="py-space-md px-space-md">
                                <span
                                  className={`font-label-token-sm text-label-token-sm font-semibold ${
                                    q.isActive
                                      ? "text-on-surface"
                                      : "text-outline"
                                  }`}
                                >
                                  {q.waitingCount}
                                </span>
                                <span className="text-body-sm text-outline">
                                  {q.isPaused ? " held" : " in line"}
                                </span>
                              </td>
                              <td
                                className={`py-space-md px-space-md font-body-sm ${
                                  q.estimatedWait.includes("High")
                                    ? "text-error font-medium"
                                    : !q.isActive
                                    ? "text-outline"
                                    : "text-on-surface-variant"
                                }`}
                              >
                                {q.estimatedWait}
                              </td>
                              <td className="py-space-md px-space-md text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {q.isActive && (
                                    <>
                                      {q.currentTokenId && (
                                        <>
                                          <button
                                            onClick={() => handleCompleteToken(q.currentTokenId)}
                                            className="px-2 py-1.5 rounded bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-label-ui text-label-ui transition-colors flex items-center gap-1"
                                            title="Complete Current"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">
                                              check_circle
                                            </span>
                                          </button>
                                          <button
                                            onClick={() => handleSkipToken(q.currentTokenId)}
                                            className="px-2 py-1.5 rounded bg-surface-container-low hover:bg-error-container text-on-surface hover:text-on-error-container font-label-ui text-label-ui transition-colors flex items-center gap-1"
                                            title="Skip Current"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">
                                              cancel
                                            </span>
                                          </button>
                                        </>
                                      )}
                                      {!q.isPaused && (
                                        <button
                                          onClick={() => handleCallNext(q.id)}
                                          className={`px-2.5 py-1.5 rounded font-label-ui text-label-ui transition-colors flex items-center gap-1 ${
                                            q.currentTokenId
                                              ? "bg-surface-container-low text-outline cursor-not-allowed"
                                              : "bg-primary text-on-primary hover:bg-primary-container"
                                          }`}
                                          disabled={!!q.currentTokenId}
                                          title={q.currentTokenId ? "Complete current token first" : ""}
                                        >
                                          <span className="material-symbols-outlined text-[15px]">
                                            campaign
                                          </span>
                                          <span>Call Next ({q.nextToCall !== "—" ? q.nextToCall : "None"})</span>
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleTogglePause(q)}
                                        className={`px-2.5 py-1.5 rounded font-label-ui text-label-ui transition-colors flex items-center gap-1 ${
                                          q.isPaused
                                            ? "bg-surface-container-high text-on-surface hover:bg-surface-container"
                                            : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                                        }`}
                                        title={q.isPaused ? "Resume Queue" : "Pause Queue"}
                                      >
                                        <span className="material-symbols-outlined text-[15px]">
                                          {q.isPaused ? "play_arrow" : "pause"}
                                        </span>
                                        <span>{q.isPaused ? "Resume" : ""}</span>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleToggleActive(q)}
                                    className="px-2 py-1.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-ui text-label-ui transition-colors flex items-center gap-1"
                                    title={q.isActive ? "Deactivate" : "Activate"}
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      {q.isActive ? "power_settings_new" : "power"}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCounter(q.id)}
                                    className="px-2 py-1.5 rounded bg-surface-container-low hover:bg-error-container text-on-surface hover:text-on-error-container font-label-ui text-label-ui transition-colors flex items-center gap-1"
                                    title="Delete"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      delete
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-space-sm bg-surface-container-low/50 flex items-center justify-between text-body-sm text-on-surface-variant px-space-md">
                      <span>Showing 6 of 12 configured counters</span>
                      <div className="flex items-center gap-2">
                        <button className="p-1 rounded hover:bg-surface-container text-outline">
                          <span className="material-symbols-outlined text-[18px]">
                            chevron_left
                          </span>
                        </button>
                        <span className="font-label-ui text-label-ui">Page 1 of 2</span>
                        <button className="p-1 rounded hover:bg-surface-container text-outline">
                          <span className="material-symbols-outlined text-[18px]">
                            chevron_right
                          </span>
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Add Counter Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
              <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        add_circle
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Add New Service Counter
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <label className="flex flex-col gap-1">
                    <span className="font-label-ui text-label-ui text-on-surface-variant">
                      Counter Name & Designation
                    </span>
                    <input
                      className="px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary font-body-md text-body-md"
                      placeholder="e.g. Triage Desk 04"
                      type="text"
                      value={newCounter.name}
                      onChange={(e) => setNewCounter({ ...newCounter, name: e.target.value })}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-space-sm">
                    <label className="flex flex-col gap-1">
                      <span className="font-label-ui text-label-ui text-on-surface-variant">
                        Service Prefix
                      </span>
                      <input
                        className="px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary font-label-token-md text-label-token-md"
                        maxLength={2}
                        placeholder="e.g. T"
                        type="text"
                        value={newCounter.prefix}
                        onChange={(e) => setNewCounter({ ...newCounter, prefix: e.target.value })}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="font-label-ui text-label-ui text-on-surface-variant">
                      Description (Optional)
                    </span>
                    <input
                      className="px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary font-body-md text-body-md"
                      placeholder="Brief description of the service"
                      type="text"
                      value={newCounter.description}
                      onChange={(e) => setNewCounter({ ...newCounter, description: e.target.value })}
                    />
                  </label>
                </div>
                <div className="flex items-center justify-end gap-space-sm mt-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-label-ui text-label-ui hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCounter}
                    className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui hover:bg-primary-container"
                  >
                    Create Counter
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
