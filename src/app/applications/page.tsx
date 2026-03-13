"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { applications as mockApplications } from "@/data/mockApplications";
import type { Application, ApplicationStatus } from "@/types/application";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | ApplicationStatus>("All");

  useEffect(() => {
    const storedApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );

    setApplications(
      storedApplications.length > 0 ? storedApplications : mockApplications
    );
  }, []);

  const handleStatusChange = (
    applicationId: number,
    newStatus: ApplicationStatus
  ) => {
    const updatedApplications = applications.map((application) =>
      application.id === applicationId
        ? { ...application, status: newStatus }
        : application
    );

    setApplications(updatedApplications);
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
  };

  const handleDelete = (applicationId: number) => {
    const updatedApplications = applications.filter(
      (application) => application.id !== applicationId
    );

    setApplications(updatedApplications);
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        application.company.toLowerCase().includes(search.toLowerCase()) ||
        application.role.toLowerCase().includes(search.toLowerCase()) ||
        application.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || application.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, selectedStatus]);

  const totalCount = applications.length;
  const appliedCount = applications.filter((a) => a.status === "Applied").length;
  const interviewCount = applications.filter(
    (a) => a.status === "Interview" || a.status === "Final Interview"
  ).length;
  const offerCount = applications.filter((a) => a.status === "Offer").length;
  const rejectedCount = applications.filter((a) => a.status === "Rejected").length;

  const statuses: ("All" | ApplicationStatus)[] = [
    "All",
    "Saved",
    "Applied",
    "OA",
    "Interview",
    "Final Interview",
    "Offer",
    "Rejected",
  ];

  const statusOptions: ApplicationStatus[] = [
    "Saved",
    "Applied",
    "OA",
    "Interview",
    "Final Interview",
    "Offer",
    "Rejected",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Applications</h1>
        <p className="mt-2 text-slate-400">
          Track internship and job applications across companies.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total</p>
          <p className="mt-2 text-5xl font-bold text-white">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-blue-800 bg-blue-950/40 p-5">
          <p className="text-sm text-blue-300">Applied</p>
          <p className="mt-2 text-5xl font-bold text-white">{appliedCount}</p>
        </div>

        <div className="rounded-2xl border border-yellow-700 bg-yellow-950/40 p-5">
          <p className="text-sm text-yellow-300">Interview</p>
          <p className="mt-2 text-5xl font-bold text-yellow-300">
            {interviewCount}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-700 bg-emerald-950/40 p-5">
          <p className="text-sm text-emerald-300">Offers</p>
          <p className="mt-2 text-5xl font-bold text-emerald-300">
            {offerCount}
          </p>
        </div>

        <div className="rounded-2xl border border-red-700 bg-red-950/40 p-5">
          <p className="text-sm text-red-300">Rejected</p>
          <p className="mt-2 text-5xl font-bold text-red-300">
            {rejectedCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <input
            type="text"
            placeholder="Search by company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
          />

          <div className="flex flex-wrap gap-3">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedStatus === status
                    ? "bg-white text-black"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white">All Applications</h2>
          <p className="mt-1 text-slate-400">
            Showing {filteredApplications.length} applications.
          </p>
        </div>

        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Date Applied</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Job Link</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredApplications.map((application) => (
              <tr
                key={application.id}
                className="border-t border-slate-800 text-slate-200"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {application.company}
                </td>

                <td className="px-6 py-4">{application.role}</td>
                <td className="px-6 py-4">{application.location || "-"}</td>
                <td className="px-6 py-4">{application.dateApplied || "-"}</td>

                <td className="px-6 py-4">
                  <select
                    value={application.status}
                    onChange={(e) =>
                      handleStatusChange(
                        application.id,
                        e.target.value as ApplicationStatus
                      )
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-slate-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-6 py-4">
                  {application.jobLink ? (
                    <a
                      href={application.jobLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline"
                    >
                      View Job
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/applications/${application.id}`}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-white transition hover:bg-slate-700"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => handleDelete(application.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-white transition hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}