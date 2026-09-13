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
import { formatApiError, FormattedApiError } from "../../../lib/errorUtils";

import { useToast } from "../../../components/Toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: userResponse, isLoading: isUserLoading, isError: isUserError } = useGetMeQuery(undefined);
  
  useEffect(() => {
    const role = userResponse?.user?.role || userResponse?.data?.role;
    if (!isUserLoading && (isUserError || role !== "ADMIN")) {
      const reason = role && role !== "ADMIN" ? "restricted" : "expired";
      router.push(`/login?redirect=%2Fadmin%2Fdashboard&reason=${reason}`);
    }
  }, [isUserLoading, isUserError, userResponse, router]);

  // Tab View State ('all' | 'counters' | 'queue')
  const [activeTab, setActiveTab] = useState<"all" | "counters" | "queue">("all");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#counters" || hash === "#counter-management") {
        setActiveTab("counters");
      } else if (hash === "#queue" || hash === "#queue-management") {
        setActiveTab("queue");
      } else {
        setActiveTab("all");
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCounter, setNewCounter] = useState({ name: "", prefix: "", description: "" });

  const [editModalData, setEditModalData] = useState<{ id: string; name: string; prefix: string; description: string } | null>(null);
  const [deleteConfirmCounter, setDeleteConfirmCounter] = useState<{ id: string; name: string } | null>(null);
  const [isPauseAllConfirmOpen, setIsPauseAllConfirmOpen] = useState(false);

  const [actionError, setActionError] = useState<FormattedApiError | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const { data: countersRes, isLoading: isCountersLoading } = useGetCountersQuery(undefined);
  const queues = countersRes?.data || [];

  const { data: statsRes } = useGetDashboardStatsQuery(undefined);
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

  const handleCallNext = async (counterId: string) => {
    setActionError(null);
    setPendingActionId(`call-${counterId}`);
    try {
      const res = await callNextToken(counterId).unwrap();
      toast.success("Next customer called", `Serving Token ${res.data?.tokenNumber || ""}`);
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleCompleteToken = async (tokenId: string) => {
    setActionError(null);
    setPendingActionId(`complete-${tokenId}`);
    try {
      await completeToken(tokenId).unwrap();
      toast.success("Token completed successfully");
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleSkipToken = async (tokenId: string) => {
    setActionError(null);
    setPendingActionId(`skip-${tokenId}`);
    try {
      await skipToken(tokenId).unwrap();
      toast.success("Token skipped");
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleTogglePause = async (counter: any) => {
    setActionError(null);
    setPendingActionId(`pause-${counter.id}`);
    try {
      if (counter.isPaused) {
        await resumeCounter(counter.id).unwrap();
        toast.success("Counter resumed", `Queue active for ${counter.name}.`);
      } else {
        await pauseCounter(counter.id).unwrap();
        toast.info("Counter paused", `Queue held for ${counter.name}.`);
      }
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handlePauseAll = async () => {
    setActionError(null);
    setIsPauseAllConfirmOpen(false);
    setPendingActionId("pause-all");
    try {
      const activeQueues = queues.filter((q: any) => q.isActive && !q.isPaused);
      if (activeQueues.length === 0) {
        toast.info("Notice", "No unpaused active counters to pause.");
        return;
      }
      await Promise.all(activeQueues.map((q: any) => pauseCounter(q.id).unwrap()));
      toast.warning("Emergency Pause All applied", "All active queues have been paused.");
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleToggleActive = async (counter: any) => {
    setActionError(null);
    setPendingActionId(`active-${counter.id}`);
    try {
      if (counter.isActive) {
        await deactivateCounter(counter.id).unwrap();
        toast.info("Counter deactivated", `${counter.name} is now offline.`);
      } else {
        await activateCounter(counter.id).unwrap();
        toast.success("Counter activated", `${counter.name} is now online.`);
      }
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmCounter) return;
    const { id, name } = deleteConfirmCounter;
    setActionError(null);
    setPendingActionId(`delete-${id}`);
    setDeleteConfirmCounter(null);
    try {
      await deleteCounter(id).unwrap();
      toast.success("Counter deleted successfully", `Desk "${name}" has been removed.`);
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleSaveNewCounter = async () => {
    setActionError(null);
    if (!newCounter.name || !newCounter.prefix) {
      const valErr = { title: "Validation error", message: "Counter name and prefix are required." };
      setActionError(valErr);
      toast.error(valErr.title, valErr.message);
      return;
    }
    setPendingActionId("create-counter");
    try {
      await createCounter(newCounter).unwrap();
      setIsAddModalOpen(false);
      setNewCounter({ name: "", prefix: "", description: "" });
      toast.success("Counter created successfully", `Service desk "${newCounter.name}" is now ready.`);
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  const handleSaveEditCounter = async () => {
    if (!editModalData) return;
    setActionError(null);
    if (!editModalData.name || !editModalData.prefix) {
      const valErr = { title: "Validation error", message: "Counter name and prefix are required." };
      setActionError(valErr);
      toast.error(valErr.title, valErr.message);
      return;
    }
    setPendingActionId(`edit-${editModalData.id}`);
    try {
      await updateCounter({
        id: editModalData.id,
        name: editModalData.name,
        prefix: editModalData.prefix,
        description: editModalData.description,
      }).unwrap();
      setEditModalData(null);
      toast.success("Counter updated successfully");
    } catch (err: any) {
      const formatted = formatApiError(err, "action");
      setActionError(formatted);
      toast.error(formatted.title, formatted.message);
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <>
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader />
        <main className="relative pt-16 w-full px-margin bg-surface pb-12">
          <div className="flex flex-col w-full">
            <div className="py-space-md flex flex-col gap-space-lg">
              {actionError && (
                <div className="p-space-md bg-error-container rounded-lg flex items-start justify-between text-on-error-container shadow-sm">
                  <div className="flex items-start gap-space-xs">
                    <span className="material-symbols-outlined text-error shrink-0">error</span>
                    <div>
                      <p className="font-label-ui font-bold">{actionError.title}</p>
                      <p className="font-body-sm text-body-sm mt-0.5">{actionError.message}</p>
                    </div>
                  </div>
                  <button onClick={() => setActionError(null)} className="text-on-error-container font-bold p-1">✕</button>
                </div>
              )}

              {/* Header Details */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-ui text-label-ui">
                    <span>Operations</span>
                    <span className="material-symbols-outlined text-[14px]">
                      chevron_right
                    </span>
                    <span className="text-primary font-semibold capitalize">
                      {activeTab === "all" ? "Real-Time Overview" : activeTab === "counters" ? "Counter Provisioning & Desk Setup" : "Live Queue Monitor & Dispatch"}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm flex-wrap mt-0.5">
                    <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        hub
                      </span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Smart Queue Management System
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm flex-wrap">
                  <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-md font-label-ui text-label-ui transition-colors ${
                        activeTab === "all"
                          ? "bg-primary text-on-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">grid_view</span>
                      <span>Overview</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("counters")}
                      className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-md font-label-ui text-label-ui transition-colors ${
                        activeTab === "counters"
                          ? "bg-primary text-on-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                      <span>Counters</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("queue")}
                      className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-md font-label-ui text-label-ui transition-colors ${
                        activeTab === "queue"
                          ? "bg-primary text-on-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">linear_scale</span>
                      <span>Queue Management</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-high text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    <span className="font-label-ui text-label-ui text-on-surface-variant">
                      Live Feed Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div id="admin-stats" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md scroll-mt-20">
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
                    <div className="bg-secondary h-full" style={{ width: stats.totalCounters ? `${Math.min((stats.activeCounters / stats.totalCounters) * 100, 100)}%` : "0%" }}></div>
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
                      style={{ width: stats.tokensToday ? `${Math.min((stats.waiting / stats.tokensToday) * 100, 100)}%` : "0%" }}
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
                      style={{ width: stats.activeCounters ? `${Math.min((stats.serving / stats.activeCounters) * 100, 100)}%` : "0%" }}
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
                    <div className="bg-surface-dim h-full" style={{ width: stats.tokensToday ? "100%" : "0%" }}></div>
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
                      style={{ width: stats.tokensToday ? `${Math.min((stats.completed / stats.tokensToday) * 100, 100)}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Tab Views */}
              <div id="counter-management" className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-sm scroll-mt-20 border border-surface-container-high">
                <div className="flex items-center gap-space-sm flex-wrap">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">desktop_windows</span>
                    {activeTab === "counters" ? "Service Counter Management" : "Quick Actions"}
                  </span>
                  {activeTab === "counters" && (
                    <span className="text-body-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {queues.length} counter{queues.length === 1 ? "" : "s"} configured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-space-xs flex-wrap">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-ui text-label-ui shadow-md font-bold"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      add_circle
                    </span>
                    <span>Create Counter</span>
                  </button>
                  <button
                    onClick={() => setIsPauseAllConfirmOpen(true)}
                    disabled={pendingActionId === "pause-all"}
                    className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors font-label-ui text-label-ui disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      pause_circle
                    </span>
                    <span>Emergency Pause All</span>
                  </button>
                </div>
              </div>

              {/* Main Content Sections */}
              <div id="queue-management" className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg scroll-mt-20">

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
                      </div>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface-container-low/50 text-on-surface-variant font-label-ui text-[11px] uppercase tracking-wider">
                            <th className="py-space-sm px-space-md">Counter Name & Description</th>
                            <th className="py-space-sm px-space-md">Prefix</th>
                            <th className="py-space-sm px-space-md">Status</th>
                            <th className="py-space-sm px-space-md">Now Serving</th>
                            <th className="py-space-sm px-space-md">Waiting</th>
                            <th className="py-space-sm px-space-md">Est. Wait</th>
                            <th className="py-space-sm px-space-md text-right">Quick Controls</th>
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
                                  {q.description && (
                                    <span className="text-body-sm text-on-surface-variant font-normal">
                                      {q.description}
                                    </span>
                                  )}
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
                                            disabled={pendingActionId === `complete-${q.currentTokenId}`}
                                            className="px-2 py-1.5 rounded bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-label-ui text-label-ui transition-colors flex items-center gap-1 disabled:opacity-50"
                                            title="Complete Current"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">
                                              check_circle
                                            </span>
                                          </button>
                                          <button
                                            onClick={() => handleSkipToken(q.currentTokenId)}
                                            disabled={pendingActionId === `skip-${q.currentTokenId}`}
                                            className="px-2 py-1.5 rounded bg-surface-container-low hover:bg-error-container text-on-surface hover:text-on-error-container font-label-ui text-label-ui transition-colors flex items-center gap-1 disabled:opacity-50"
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
                                          disabled={!!q.currentTokenId || pendingActionId === `call-${q.id}`}
                                          title={q.currentTokenId ? "Complete current token first" : "Call Next"}
                                        >
                                          <span className="material-symbols-outlined text-[15px]">
                                            campaign
                                          </span>
                                          <span>Call Next ({q.nextToCall !== "—" ? q.nextToCall : "None"})</span>
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleTogglePause(q)}
                                        disabled={pendingActionId === `pause-${q.id}`}
                                        className={`px-2.5 py-1.5 rounded font-label-ui text-label-ui transition-colors flex items-center gap-1 ${
                                          q.isPaused
                                            ? "bg-surface-container-high text-on-surface hover:bg-surface-container"
                                            : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                                        } disabled:opacity-50`}
                                        title={q.isPaused ? "Resume Queue" : "Pause Queue"}
                                      >
                                        <span className="material-symbols-outlined text-[15px]">
                                          {q.isPaused ? "play_arrow" : "pause"}
                                        </span>
                                        <span>{q.isPaused ? "Resume" : "Pause"}</span>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleToggleActive(q)}
                                    disabled={pendingActionId === `active-${q.id}`}
                                    className="px-2 py-1.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-ui text-label-ui transition-colors flex items-center gap-1 disabled:opacity-50"
                                    title={q.isActive ? "Deactivate Counter" : "Activate Counter"}
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      {q.isActive ? "power_settings_new" : "power"}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => setEditModalData({ id: q.id, name: q.name, prefix: q.prefix, description: q.description || "" })}
                                    className="px-2 py-1.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-ui text-label-ui transition-colors flex items-center gap-1"
                                    title="Edit Counter"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">
                                      edit
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmCounter({ id: q.id, name: q.name })}
                                    className="px-2 py-1.5 rounded bg-surface-container-low hover:bg-error-container text-on-surface hover:text-on-error-container font-label-ui text-label-ui transition-colors flex items-center gap-1"
                                    title="Delete Counter"
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
                      <span>Showing {queues.length} configured counter{queues.length === 1 ? "" : "s"}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Add Counter Modal */}
          {isAddModalOpen && (
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
                    onClick={() => setIsAddModalOpen(false)}
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
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-label-ui text-label-ui hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewCounter}
                    disabled={pendingActionId === "create-counter"}
                    className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui hover:bg-primary-container disabled:opacity-50"
                  >
                    {pendingActionId === "create-counter" ? "Creating..." : "Create Counter"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Counter Modal */}
          {editModalData && (
            <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
              <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Edit Service Counter
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditModalData(null)}
                    className="p-1 rounded text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <label className="flex flex-col gap-1">
                    <span className="font-label-ui text-label-ui text-on-surface-variant">
                      Counter Name
                    </span>
                    <input
                      className="px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary font-body-md text-body-md"
                      type="text"
                      value={editModalData.name}
                      onChange={(e) => setEditModalData({ ...editModalData, name: e.target.value })}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-space-sm">
                    <label className="flex flex-col gap-1">
                      <span className="font-label-ui text-label-ui text-on-surface-variant">
                        Prefix
                      </span>
                      <input
                        className="px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary font-label-token-md text-label-token-md"
                        maxLength={2}
                        type="text"
                        value={editModalData.prefix}
                        onChange={(e) => setEditModalData({ ...editModalData, prefix: e.target.value })}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="font-label-ui text-label-ui text-on-surface-variant">
                      Description
                    </span>
                    <input
                      className="px-space-sm py-2 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary font-body-md text-body-md"
                      type="text"
                      value={editModalData.description}
                      onChange={(e) => setEditModalData({ ...editModalData, description: e.target.value })}
                    />
                  </label>
                </div>
                <div className="flex items-center justify-end gap-space-sm mt-2">
                  <button
                    onClick={() => setEditModalData(null)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-label-ui text-label-ui hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditCounter}
                    disabled={pendingActionId === `edit-${editModalData.id}`}
                    className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-ui text-label-ui hover:bg-primary-container disabled:opacity-50"
                  >
                    {pendingActionId === `edit-${editModalData.id}` ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmCounter && (
            <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
              <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-xl flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs text-error">
                  <span className="material-symbols-outlined text-[24px]">warning</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Delete Counter?
                  </h3>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Are you sure you want to delete counter <strong className="text-on-surface">{deleteConfirmCounter.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-space-sm mt-2">
                  <button
                    onClick={() => setDeleteConfirmCounter(null)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-label-ui text-label-ui hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={pendingActionId === `delete-${deleteConfirmCounter.id}`}
                    className="px-space-md py-2 rounded-lg bg-error text-on-error font-label-ui text-label-ui hover:bg-error-container disabled:opacity-50"
                  >
                    {pendingActionId === `delete-${deleteConfirmCounter.id}` ? "Deleting..." : "Delete Counter"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Pause All Confirmation Modal */}
          {isPauseAllConfirmOpen && (
            <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
              <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-xl flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs text-error">
                  <span className="material-symbols-outlined text-[24px]">pause_circle</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Emergency Pause All?
                  </h3>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  This will pause all currently active queues across all service desks. You will need to resume individual counters manually when operations resume.
                </p>
                <div className="flex items-center justify-end gap-space-sm mt-2">
                  <button
                    onClick={() => setIsPauseAllConfirmOpen(false)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-label-ui text-label-ui hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePauseAll}
                    disabled={pendingActionId === "pause-all"}
                    className="px-space-md py-2 rounded-lg bg-error text-on-error font-label-ui text-label-ui hover:bg-error-container disabled:opacity-50"
                  >
                    {pendingActionId === "pause-all" ? "Pausing All..." : "Pause All Queues"}
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
