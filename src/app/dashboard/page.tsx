"use client";

import { useEffect, useMemo, useState } from "react";
import { applications as mockApplications } from "@/data/mockApplications";
import { contacts as mockContacts } from "@/data/mockContacts";

type Application = {
  id: number;
  company: string;
  role: string;
  location?: string;
  jobLink?: string;
  status: string;
  dateApplied: string;
  resumeVersion?: string;
  coverLetterVersion?: string;
  notes?: string;
};

type Contact = {
  id: number;
  name: string;
  company: string;
  role: string;
  email: string;
  linkedin?: string;
  lastContact: string;
  notes?: string;
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const storedApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );
    const storedContacts = JSON.parse(
      localStorage.getItem("contacts") || "[]"
    );

    setApplications(
      storedApplications.length > 0 ? storedApplications : mockApplications
    );
    setContacts(storedContacts.length > 0 ? storedContacts : mockContacts);
  }, []);

  const totalApplications = applications.length;

  const appliedCount = applications.filter(
    (application) => application.status === "Applied"
  ).length;

  const interviewCount = applications.filter(
    (application) =>
      application.status === "Interview" ||
      application.status === "Final Interview"
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "Offer"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  const statusCounts = useMemo(() => {
    return {
      Saved: applications.filter((a) => a.status === "Saved").length,
      Applied: applications.filter((a) => a.status === "Applied").length,
      OA: applications.filter((a) => a.status === "OA").length,
      Interview: applications.filter((a) => a.status === "Interview").length,
      FinalInterview: applications.filter(
        (a) => a.status === "Final Interview"
      ).length,
      Offer: applications.filter((a) => a.status === "Offer").length,
      Rejected: applications.filter((a) => a.status === "Rejected").length,
    };
  }, [applications]);

  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.dateApplied || "1970-01-01").getTime() -
        new Date(a.dateApplied || "1970-01-01").getTime()
    )
    .slice(0, 4);

  const recentContacts = [...contacts]
    .sort(
      (a, b) =>
        new Date(b.lastContact || "1970-01-01").getTime() -
        new Date(a.lastContact || "1970-01-01").getTime()
    )
    .slice(0, 4);

  const chartData = [
    { label: "Applied", value: statusCounts.Applied, color: "bg-blue-500" },
    { label: "Interview", value: statusCounts.Interview, color: "bg-yellow-400" },
    {
      label: "Final Interview",
      value: statusCounts.FinalInterview,
      color: "bg-pink-500",
    },
    { label: "Offer", value: statusCounts.Offer, color: "bg-emerald-500" },
    { label: "Rejected", value: statusCounts.Rejected, color: "bg-red-500" },
  ].filter((item) => item.value > 0);

  const totalForPie = chartData.reduce((sum, item) => sum + item.value, 0);

  const conicSegments = (() => {
    if (totalForPie === 0) {
      return "conic-gradient(#334155 0deg 360deg)";
    }

    let currentDeg = 0;
    const colorMap: Record<string, string> = {
      "bg-blue-500": "#3b82f6",
      "bg-yellow-400": "#facc15",
      "bg-pink-500": "#ec4899",
      "bg-emerald-500": "#10b981",
      "bg-red-500": "#ef4444",
    };

    const segments = chartData.map((item) => {
      const degrees = (item.value / totalForPie) * 360;
      const start = currentDeg;
      const end = currentDeg + degrees;
      currentDeg = end;
      return `${colorMap[item.color]} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(", ")})`;
  })();

  const maxBarValue = Math.max(
    statusCounts.Saved,
    statusCounts.Applied,
    statusCounts.OA,
    statusCounts.Interview,
    statusCounts.FinalInterview,
    statusCounts.Offer,
    statusCounts.Rejected,
    1
  );

  const barData = [
    { label: "Saved", value: statusCounts.Saved, color: "bg-slate-400" },
    { label: "Applied", value: statusCounts.Applied, color: "bg-blue-500" },
    { label: "OA", value: statusCounts.OA, color: "bg-purple-500" },
    { label: "Interview", value: statusCounts.Interview, color: "bg-yellow-400" },
    {
      label: "Final",
      value: statusCounts.FinalInterview,
      color: "bg-pink-500",
    },
    { label: "Offer", value: statusCounts.Offer, color: "bg-emerald-500" },
    { label: "Rejected", value: statusCounts.Rejected, color: "bg-red-500" },
  ];

  const monthlyApplications = useMemo(() => {
    const monthMap = new Map<string, number>();

    applications.forEach((application) => {
      if (!application.dateApplied) return;

      const date = new Date(application.dateApplied);
      if (isNaN(date.getTime())) return;

      const label = date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      monthMap.set(label, (monthMap.get(label) || 0) + 1);
    });

    return Array.from(monthMap.entries())
      .map(([label, value]) => {
        const [month, year] = label.split(" ");
        const sortableDate = new Date(`${month} 1, ${year}`);
        return { label, value, sortableDate };
      })
      .sort((a, b) => a.sortableDate.getTime() - b.sortableDate.getTime());
  }, [applications]);

  const maxMonthlyValue = Math.max(
    ...monthlyApplications.map((item) => item.value),
    1
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Track applications, interviews, and networking activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Applications</p>
          <p className="mt-2 text-5xl font-bold text-white">{totalApplications}</p>
        </div>

        <div className="rounded-2xl border border-blue-800 bg-blue-950/40 p-5">
          <p className="text-sm text-blue-300">Applied</p>
          <p className="mt-2 text-5xl font-bold text-white">{appliedCount}</p>
        </div>

        <div className="rounded-2xl border border-yellow-700 bg-yellow-950/40 p-5">
          <p className="text-sm text-yellow-300">Interviews</p>
          <p className="mt-2 text-5xl font-bold text-yellow-300">
            {interviewCount}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-700 bg-emerald-950/40 p-5">
          <p className="text-sm text-emerald-300">Offers</p>
          <p className="mt-2 text-5xl font-bold text-emerald-300">{offerCount}</p>
        </div>

        <div className="rounded-2xl border border-red-800 bg-red-950/40 p-5">
          <p className="text-sm text-red-300">Rejected</p>
          <p className="mt-2 text-5xl font-bold text-red-300">
            {rejectedCount}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold text-white">
            Application Status Breakdown
          </h2>
          <p className="mt-1 text-slate-400">
            Visual view of your application pipeline.
          </p>

          <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <div
              className="relative h-44 w-44 rounded-full"
              style={{ background: conicSegments }}
            >
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900" />
            </div>

            <div className="w-full max-w-xs space-y-3">
              {chartData.length > 0 ? (
                chartData.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-white">{item.label}</span>
                    </div>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-slate-950 px-4 py-6 text-center text-slate-400">
                  No application status data yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold text-white">Pipeline Overview</h2>
          <p className="mt-1 text-slate-400">
            Track where your applications are sitting.
          </p>

          <div className="mt-8">
            <div className="flex h-64 items-end gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              {barData.map((item) => (
                <div
                  key={item.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="text-sm text-slate-400">{item.value}</div>
                  <div
                    className={`w-full rounded-t-xl ${item.color}`}
                    style={{
                      height: `${(item.value / maxBarValue) * 180}px`,
                      minHeight: item.value > 0 ? "12px" : "0px",
                    }}
                  />
                  <div className="text-center text-sm text-slate-300">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-semibold text-white">
          Applications by Month
        </h2>
        <p className="mt-1 text-slate-400">
          See how your recruiting activity changes over time.
        </p>

        <div className="mt-8">
          {monthlyApplications.length > 0 ? (
            <div className="flex h-72 items-end gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              {monthlyApplications.map((item) => (
                <div
                  key={item.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >
                  <div className="text-sm text-slate-400">{item.value}</div>
                  <div
                    className="w-full rounded-t-xl bg-cyan-500"
                    style={{
                      height: `${(item.value / maxMonthlyValue) * 220}px`,
                      minHeight: item.value > 0 ? "16px" : "0px",
                    }}
                  />
                  <div className="text-center text-sm text-slate-300">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400">
              No application month data yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-2xl font-semibold text-white">
              Recent Applications
            </h2>
            <p className="mt-1 text-slate-400">Your latest tracked applications.</p>
          </div>

          <div>
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between border-b border-slate-800 px-6 py-5 last:border-0"
                >
                  <div>
                    <p className="font-medium text-white">{application.company}</p>
                    <p className="text-slate-400">{application.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                      {application.status}
                    </span>
                    <p className="mt-2 text-sm text-slate-500">
                      {application.dateApplied}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-slate-400">No applications yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-2xl font-semibold text-white">Recent Contacts</h2>
            <p className="mt-1 text-slate-400">
              Recruiters and networking conversations.
            </p>
          </div>

          <div>
            {recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between border-b border-slate-800 px-6 py-5 last:border-0"
                >
                  <div>
                    <p className="font-medium text-white">{contact.name}</p>
                    <p className="text-slate-400">
                      {contact.company} • {contact.role}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">{contact.lastContact}</p>
                </div>
              ))
            ) : (
              <p className="p-6 text-slate-400">No contacts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}