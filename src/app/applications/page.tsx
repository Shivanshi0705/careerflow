"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Eye,
  Filter,
  TrendingUp,
  ChevronDown,
  Pencil,
  ArrowUpRight,
  Activity,
  Target,
} from "lucide-react";
import { getStoredApplications, saveApplications } from "@/lib/applicationStorage";
import {
  APPLICATION_STATUS_ORDER,
  formatApplicationDate,
  getApplicationActivityDescription,
  getApplicationActivityLabel,
  getApplicationMetrics,
} from "@/lib/applicationMetrics";
import type { Application, ApplicationStatus } from "@/types/application";
import StatusBadge from "@/components/StatusBadge";

function sortByLatestApplied(applications: Application[]) {
  return [...applications].sort((a, b) => {
    const aTime = new Date(a.dateApplied || 0).getTime();
    const bTime = new Date(b.dateApplied || 0).getTime();
    return bTime - aTime;
  });
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | ApplicationStatus>("All");

  useEffect(() => {
    const loadApplications = () => {
      setApplications(sortByLatestApplied(getStoredApplications()));
    };

    loadApplications();

    window.addEventListener("focus", loadApplications);
    window.addEventListener("storage", loadApplications);
    window.addEventListener("applicationsUpdated", loadApplications);

    return () => {
      window.removeEventListener("focus", loadApplications);
      window.removeEventListener("storage", loadApplications);
      window.removeEventListener("applicationsUpdated", loadApplications);
    };
  }, []);

  const statusOptions: ApplicationStatus[] = APPLICATION_STATUS_ORDER;
  const filterOptions: ("All" | ApplicationStatus)[] = ["All", ...statusOptions];

  const handleStatusChange = (
    applicationId: number,
    newStatus: ApplicationStatus
  ) => {
    const updatedApplications = applications.map((application) =>
      application.id === applicationId
        ? {
            ...application,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        : application
    );

    const sortedApplications = sortByLatestApplied(updatedApplications);
    setApplications(sortedApplications);
    saveApplications(sortedApplications);
  };

  const handleDelete = (applicationId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    const updatedApplications = applications.filter(
      (application) => application.id !== applicationId
    );

    const sortedApplications = sortByLatestApplied(updatedApplications);
    setApplications(sortedApplications);
    saveApplications(sortedApplications);
  };

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortByLatestApplied(applications).filter((application) => {
      const company = application.company?.toLowerCase() || "";
      const role = application.role?.toLowerCase() || "";
      const location = application.location?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        company.includes(query) ||
        role.includes(query) ||
        location.includes(query);

      const matchesStatus =
        selectedStatus === "All" || application.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, selectedStatus]);

  const {
    activePipelineCount,
    interviewRate,
    offerRate,
    sortedByActivity,
  } = useMemo(() => getApplicationMetrics(applications), [applications]);

  const recentActivity = useMemo(() => {
    return sortedByActivity.slice(0, 4);
  }, [sortedByActivity]);

  const totalApplications = applications.length;
  const offerCount = applications.filter(
    (application) => application.status === "Offer"
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] px-6 py-8 shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              Application pipeline
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white">
              Applications
            </h1>

            <p className="mt-2 max-w-2xl text-zinc-400">
              Track internship and job applications, update stages, and stay on
              top of your recruiting progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/applications/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition duration-200 hover:scale-[1.02] hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition duration-200 hover:bg-white/10"
            >
              <TrendingUp className="h-4 w-4" />
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_1fr] xl:items-stretch">
        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Success Metrics</h2>
              <p className="mt-1 text-sm text-zinc-400">
                A quick snapshot of how your application cycle is performing.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-300 sm:flex">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/5 bg-[#141417] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Interview Rate</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-white">
                  {interviewRate}%
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(interviewRate, 100)}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-zinc-400">
              Percentage of non-saved applications that reached interview stage.
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#141417] p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                  <Target className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Offers
                </p>
              </div>

              <p className="mt-5 text-3xl font-bold text-white">{offerRate}%</p>
              <p className="mt-2 text-sm text-zinc-400">
                {offerCount} offer{offerCount === 1 ? "" : "s"} received so far.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#141417] p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-300">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Active
                </p>
              </div>

              <p className="mt-5 text-3xl font-bold text-white">
                {activePipelineCount}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Roles still active in your pipeline right now.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/5 bg-[#141417] px-4 py-2 text-sm text-zinc-300">
              Total tracked: {totalApplications}
            </span>
            <span className="rounded-full border border-white/5 bg-[#141417] px-4 py-2 text-sm text-zinc-300">
              Sorted by latest applied
            </span>
            <span className="rounded-full border border-white/5 bg-[#141417] px-4 py-2 text-sm text-zinc-300">
              Saved roles excluded from rates
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] shadow-xl">
          <div className="border-b border-white/5 p-6">
            <h2 className="text-2xl font-semibold text-white">
              Recent Activity
            </h2>
            <p className="mt-1 text-zinc-400">
              Latest updates across your tracked applications.
            </p>
          </div>

          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {recentActivity.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl border border-white/5 bg-[#141417] p-4 transition hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {application.company}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {application.role}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          {getApplicationActivityLabel(application.status)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          {getApplicationActivityDescription(application)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <StatusBadge status={application.status} />
                        <p className="mt-2 text-xs text-zinc-500">
                          {formatApplicationDate(
                            application.updatedAt ||
                              application.createdAt ||
                              application.dateApplied
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-[#141417] text-zinc-400">
                  <Sparkles className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white">
                  No activity yet
                </h3>

                <p className="mt-2 text-zinc-400">
                  Your latest application updates will show up here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#1f1f23] shadow-xl">
        <div className="border-b border-white/5 p-6">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                All Applications
              </h2>
              <p className="mt-1 text-zinc-400">
                {filteredApplications.length} application
                {filteredApplications.length === 1 ? "" : "s"} tracked.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/5 bg-[#141417] px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by company, role, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              <div className="relative w-full lg:w-[240px]">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as "All" | ApplicationStatus)
                  }
                  className="w-full appearance-none rounded-2xl border border-white/5 bg-[#141417] py-3 pl-11 pr-11 text-sm text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
                >
                  {filterOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "Filter by status" : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((status) => {
                const isActive = selectedStatus === status;

                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
                      isActive
                        ? "bg-white text-black"
                        : "border border-white/5 bg-[#141417] text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-[#141417] text-zinc-400">
                <tr>
                  <th className="whitespace-nowrap px-6 py-4">Company</th>
                  <th className="whitespace-nowrap px-6 py-4">Role</th>
                  <th className="whitespace-nowrap px-6 py-4">Location</th>
                  <th className="whitespace-nowrap px-6 py-4">Date Applied</th>
                  <th className="whitespace-nowrap px-6 py-4">Status</th>
                  <th className="whitespace-nowrap px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-t border-white/5 text-zinc-200 transition hover:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-6 py-5 align-top font-medium text-white">
                      {application.company}
                    </td>

                    <td className="min-w-[240px] px-6 py-5 align-top">
                      <div className="max-w-[260px] leading-6 text-zinc-200">
                        {application.role}
                      </div>
                    </td>

                    <td className="min-w-[180px] px-6 py-5 align-top">
                      <div className="max-w-[180px] text-zinc-200">
                        {application.location || "-"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 align-top text-zinc-300">
                      {formatApplicationDate(application.dateApplied)}
                    </td>

                    <td className="px-6 py-5 align-top">
                      <select
                        value={application.status}
                        onChange={(e) =>
                          handleStatusChange(
                            application.id,
                            e.target.value as ApplicationStatus
                          )
                        }
                        className="min-w-[150px] rounded-xl border border-white/10 bg-[#141417] px-3 py-2 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Link
                          href={`/applications/${application.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-300 transition hover:bg-blue-500/20"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>

                        <Link
                          href={`/applications/${application.id}/edit`}
                          className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-violet-300 transition hover:bg-violet-500/20"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(application.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-[#141417] text-zinc-400">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-xl font-semibold text-white">
              No matching applications
            </h3>

            <p className="mt-2 text-zinc-400">
              Try changing your search or filter, or add a new role to your
              tracker.
            </p>

            <Link
              href="/applications/new"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}