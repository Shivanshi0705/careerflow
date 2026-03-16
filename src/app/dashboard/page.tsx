"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Send,
  CalendarClock,
  Trophy,
  CircleX,
  ChevronRight,
  Target,
  TrendingUp,
  Clock3,
} from "lucide-react";
import { contacts as mockContacts } from "@/data/mockContacts";
import { getStoredApplications } from "@/lib/applicationStorage";
import {
  formatApplicationDate,
  getApplicationActivityDescription,
  getApplicationActivityLabel,
  getApplicationMetrics,
  getDaysAgo,
} from "@/lib/applicationMetrics";
import StatusBadge from "@/components/StatusBadge";
import type { Application } from "@/types/application";

type Contact = {
  id: number;
  name: string;
  company: string;
  role: string;
  email: string;
  linkedin?: string;
  lastContact: string;
  notes?: string;
  createdAt?: string;
};

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  accentClasses: string;
};

function formatDate(dateString?: string) {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sortContactsByNewest(contacts: Contact[]) {
  return [...contacts].sort((a, b) => {
    const aTime = new Date(
      a.createdAt || a.lastContact || "1970-01-01"
    ).getTime();
    const bTime = new Date(
      b.createdAt || b.lastContact || "1970-01-01"
    ).getTime();

    return bTime - aTime;
  });
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentClasses,
}: StatCardProps) {
  return (
    <div
      className={`group rounded-3xl border p-5 transition duration-200 hover:-translate-y-1 hover:shadow-2xl ${accentClasses}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-3 text-5xl font-bold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-3 text-sm text-zinc-400">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/90">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const storedContacts = JSON.parse(
          localStorage.getItem("contacts") || "[]"
        );

        setApplications(getStoredApplications());
        setContacts(
          sortContactsByNewest(
            storedContacts.length > 0 ? storedContacts : mockContacts
          )
        );
      } catch {
        setApplications(getStoredApplications());
        setContacts(sortContactsByNewest(mockContacts));
      }
    };

    loadDashboardData();

    window.addEventListener("focus", loadDashboardData);
    window.addEventListener("storage", loadDashboardData);
    window.addEventListener("applicationsUpdated", loadDashboardData);
    window.addEventListener("contactsUpdated", loadDashboardData);

    return () => {
      window.removeEventListener("focus", loadDashboardData);
      window.removeEventListener("storage", loadDashboardData);
      window.removeEventListener("applicationsUpdated", loadDashboardData);
      window.removeEventListener("contactsUpdated", loadDashboardData);
    };
  }, []);

  const {
    totalApplications,
    actionableCount,
    appliedCount,
    interviewCount,
    offerCount,
    rejectedCount,
    statusCounts,
    interviewRate,
    offerRate,
    sortedByActivity,
    latestAppliedByDate,
    latestInterview,
    latestOffer,
    latestRejected,
  } = useMemo(() => getApplicationMetrics(applications), [applications]);

  const recentActivity = useMemo(() => {
    return sortedByActivity.slice(0, 5);
  }, [sortedByActivity]);

  const recentContacts = useMemo(() => {
    return sortContactsByNewest(contacts).slice(0, 8);
  }, [contacts]);

  const chartData = [
    {
      label: "Applied",
      value: statusCounts.Applied,
      colorClass: "bg-blue-500",
      colorHex: "#3b82f6",
      description: "Applications sent",
    },
    {
      label: "OA",
      value: statusCounts.OA,
      colorClass: "bg-indigo-500",
      colorHex: "#6366f1",
      description: "Online assessments",
    },
    {
      label: "Interview",
      value: statusCounts.Interview,
      colorClass: "bg-violet-500",
      colorHex: "#8b5cf6",
      description: "Interview rounds",
    },
    {
      label: "Final Interview",
      value: statusCounts.FinalInterview,
      colorClass: "bg-fuchsia-500",
      colorHex: "#d946ef",
      description: "Final rounds",
    },
    {
      label: "Offer",
      value: statusCounts.Offer,
      colorClass: "bg-emerald-500",
      colorHex: "#10b981",
      description: "Offers received",
    },
    {
      label: "Rejected",
      value: statusCounts.Rejected,
      colorClass: "bg-rose-500",
      colorHex: "#f43f5e",
      description: "Closed applications",
    },
  ].filter((item) => item.value > 0);

  const totalForPie = chartData.reduce((sum, item) => sum + item.value, 0);

  const conicSegments = (() => {
    if (totalForPie === 0) {
      return "conic-gradient(#3f3f46 0deg 360deg)";
    }

    let currentDeg = 0;

    const segments = chartData.map((item) => {
      const degrees = (item.value / totalForPie) * 360;
      const start = currentDeg;
      const end = currentDeg + degrees;
      currentDeg = end;
      return `${item.colorHex} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  })();

  const pipelineStages = [
    {
      label: "Applied",
      value: statusCounts.Applied,
      width:
        actionableCount > 0
          ? Math.max((statusCounts.Applied / actionableCount) * 100, 16)
          : 16,
      color: "bg-blue-500/90",
      description: "Applications sent",
    },
    {
      label: "OA",
      value: statusCounts.OA,
      width:
        actionableCount > 0
          ? Math.max((statusCounts.OA / actionableCount) * 100, 14)
          : 14,
      color: "bg-indigo-500/90",
      description: "Online assessments",
    },
    {
      label: "Interview",
      value: statusCounts.Interview,
      width:
        actionableCount > 0
          ? Math.max((statusCounts.Interview / actionableCount) * 100, 12)
          : 12,
      color: "bg-violet-500/90",
      description: "Interview rounds",
    },
    {
      label: "Final Interview",
      value: statusCounts.FinalInterview,
      width:
        actionableCount > 0
          ? Math.max((statusCounts.FinalInterview / actionableCount) * 100, 10)
          : 10,
      color: "bg-fuchsia-500/90",
      description: "Final-stage roles",
    },
    {
      label: "Offer",
      value: statusCounts.Offer,
      width:
        actionableCount > 0
          ? Math.max((statusCounts.Offer / actionableCount) * 100, 8)
          : 8,
      color: "bg-emerald-500/90",
      description: "Offers received",
    },
  ];

  const upcomingActions = [
    latestInterview
      ? {
          title: "Prepare for interview",
          detail: `${latestInterview.company} · ${latestInterview.role}`,
          meta: `Current stage: ${latestInterview.status}`,
          icon: <CalendarClock className="h-4 w-4" />,
          accent: "text-violet-300 bg-violet-500/10 border-violet-500/20",
        }
      : null,
    latestAppliedByDate
      ? {
          title: "Follow up on latest application",
          detail: `${latestAppliedByDate.company} · ${latestAppliedByDate.role}`,
          meta: `Applied ${getDaysAgo(latestAppliedByDate.dateApplied)}`,
          icon: <Send className="h-4 w-4" />,
          accent: "text-blue-300 bg-blue-500/10 border-blue-500/20",
        }
      : null,
    recentContacts[0]
      ? {
          title: "Reconnect with contact",
          detail: `${recentContacts[0].name} · ${recentContacts[0].company}`,
          meta: `Added ${formatDate(
            recentContacts[0].createdAt || recentContacts[0].lastContact
          )}`,
          icon: <Clock3 className="h-4 w-4" />,
          accent: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
        }
      : null,
  ].filter(Boolean) as {
    title: string;
    detail: string;
    meta: string;
    icon: React.ReactNode;
    accent: string;
  }[];

  return (
    <div className="space-y-8 bg-[#18181b] text-white">
      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] px-6 py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <TrendingUp className="h-3.5 w-3.5" />
              Career dashboard overview
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Track applications, monitor your pipeline, and stay on top of your
              next recruiting moves.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-[#141417] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Interview Rate
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {interviewRate}%
              </p>
              <p className="mt-1 text-xs text-zinc-500">Excludes saved roles</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#141417] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Offer Rate
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {offerRate}%
              </p>
              <p className="mt-1 text-xs text-zinc-500">Excludes saved roles</p>
            </div>

            <div className="col-span-2 rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 sm:col-span-1">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Last Applied
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {latestAppliedByDate
                  ? latestAppliedByDate.company
                  : "No applications yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {latestAppliedByDate
                  ? formatApplicationDate(latestAppliedByDate.dateApplied)
                  : "Most recent by applied date"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Applications"
          value={totalApplications}
          subtitle={
            totalApplications > 0
              ? `${recentActivity.length} recent updates tracked`
              : "Start adding roles to build your pipeline"
          }
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          accentClasses="border-white/5 bg-[#1f1f23]"
        />

        <StatCard
          title="Applied"
          value={appliedCount}
          subtitle={
            latestAppliedByDate
              ? `Latest: ${latestAppliedByDate.company}`
              : "No submitted applications yet"
          }
          icon={<Send className="h-5 w-5" />}
          accentClasses="border-blue-500/30 bg-blue-500/10"
        />

        <StatCard
          title="Interviews"
          value={interviewCount}
          subtitle={
            latestInterview
              ? `In progress: ${latestInterview.company}`
              : "No interviews scheduled yet"
          }
          icon={<CalendarClock className="h-5 w-5" />}
          accentClasses="border-violet-500/30 bg-violet-500/10"
        />

        <StatCard
          title="Offers"
          value={offerCount}
          subtitle={
            latestOffer
              ? `Top outcome: ${latestOffer.company}`
              : "No offers received yet"
          }
          icon={<Trophy className="h-5 w-5" />}
          accentClasses="border-emerald-500/30 bg-emerald-500/10"
        />

        <StatCard
          title="Rejected"
          value={rejectedCount}
          subtitle={
            latestRejected
              ? `Most recent: ${latestRejected.company}`
              : "No rejections logged"
          }
          icon={<CircleX className="h-5 w-5" />}
          accentClasses="border-rose-500/30 bg-rose-500/10"
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.02fr_1fr]">
        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">
            Application Status Breakdown
          </h2>
          <p className="mt-1 text-zinc-400">
            A compact view of how your active pipeline is distributed.
          </p>

          <div className="mt-6 flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="relative h-40 w-40 shrink-0 rounded-full"
              style={{ background: conicSegments }}
            >
              <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/5 bg-[#18181b]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Total
                </span>
                <span className="text-2xl font-bold text-white">
                  {totalForPie}
                </span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {chartData.length > 0 ? (
                chartData.map((item) => {
                  const percentage =
                    totalForPie > 0
                      ? Math.round((item.value / totalForPie) * 100)
                      : 0;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/5 bg-[#141417] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-3 w-3 rounded-full ${item.colorClass}`}
                            />
                            <span className="text-sm font-medium text-white">
                              {item.label}
                            </span>
                          </div>
                          <p className="mt-1 pl-6 text-xs text-zinc-500">
                            {item.description}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-white">{item.value}</p>
                          <p className="text-xs text-zinc-500">{percentage}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-white/5 bg-[#141417] px-4 py-6 text-center text-zinc-400">
                  No application status data yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Next Actions</h2>
              <p className="mt-1 text-zinc-400">
                The most important things to focus on next.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-[#141417] text-zinc-300">
              <Target className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {upcomingActions.length > 0 ? (
              upcomingActions.map((action, index) => (
                <div
                  key={`${action.title}-${index}`}
                  className={`rounded-2xl border px-4 py-4 ${action.accent}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        {action.icon}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-white">{action.title}</p>
                        <p className="mt-1 truncate text-sm text-zinc-300">
                          {action.detail}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {action.meta}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/5 bg-[#141417] p-6 text-center text-zinc-400">
                Add a few applications or contacts to start generating next-step
                suggestions.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Pipeline Funnel</h2>
            <p className="mt-1 text-zinc-400">
              A stage-by-stage view of how your non-saved applications are
              progressing.
            </p>
          </div>

          <p className="text-sm text-zinc-500">Saved roles excluded</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {pipelineStages.map((stage) => (
            <div
              key={stage.label}
              className="rounded-2xl border border-white/5 bg-[#141417] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{stage.label}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {stage.description}
                  </p>
                </div>
                <p className="text-lg font-semibold text-white">{stage.value}</p>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white/5">
                <div
                  className={`h-3 rounded-full ${stage.color} transition-all duration-500`}
                  style={{ width: `${stage.width}%` }}
                  title={`${stage.label}: ${stage.value}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] shadow-xl">
          <div className="border-b border-white/5 p-6">
            <h2 className="text-2xl font-semibold text-white">Recent Activity</h2>
            <p className="mt-1 text-zinc-400">
              Latest updates across all tracked applications.
            </p>
          </div>

          <div>
            {recentActivity.length > 0 ? (
              recentActivity.map((application) => (
                <div
                  key={application.id}
                  className="border-b border-white/5 px-6 py-5 last:border-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-white">
                        {application.company}
                      </p>
                      <p className="mt-1 text-zinc-400">{application.role}</p>
                      <p className="mt-2 text-sm text-zinc-500">
                        {getApplicationActivityLabel(application.status)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {getApplicationActivityDescription(application)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <StatusBadge status={application.status} />
                      <p className="mt-2 text-sm text-zinc-500">
                        {formatApplicationDate(
                          application.updatedAt ||
                            application.createdAt ||
                            application.dateApplied
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-zinc-400">No recent activity yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] shadow-xl">
          <div className="border-b border-white/5 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Recent Contacts
                </h2>
                <p className="mt-1 text-zinc-400">
                  Newest contacts added to your network tracker.
                </p>
              </div>

              <Link
                href="/contacts"
                className="text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                View all
              </Link>
            </div>
          </div>

          <div>
            {recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border-b border-white/5 px-6 py-5 last:border-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{contact.name}</p>
                      <p className="mt-1 text-zinc-400">{contact.role}</p>
                    </div>

                    <p className="shrink-0 text-sm text-zinc-500">
                      {formatDate(contact.createdAt || contact.lastContact)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-zinc-400">No contacts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}