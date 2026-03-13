"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { applications as mockApplications } from "@/data/mockApplications";
import type { Application } from "@/types/application";

export default function EditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );

    const baseApplications =
      storedApplications.length > 0 ? storedApplications : mockApplications;

    const foundApplication = baseApplications.find(
      (app: Application) => app.id === id
    );

    setApplication(foundApplication || null);
    setLoading(false);
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!application) return;

    const { name, value } = e.target;

    setApplication({
      ...application,
      [name]: value,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!application) return;

    const storedApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );

    const baseApplications =
      storedApplications.length > 0 ? storedApplications : mockApplications;

    const updatedApplications = baseApplications.map((app: Application) =>
      app.id === application.id ? application : app
    );

    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    router.push(`/applications/${application.id}`);
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!application) {
    return (
      <div className="space-y-4">
        <p className="text-white">Application not found</p>
        <Link
          href="/applications"
          className="inline-block rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Edit Application</h1>
        <p className="mt-2 text-slate-400">
          Update your application details.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-200">Company</label>
            <input
              type="text"
              name="company"
              value={application.company}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Role</label>
            <input
              type="text"
              name="role"
              value={application.role}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Location</label>
            <input
              type="text"
              name="location"
              value={application.location}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Job Link</label>
            <input
              type="url"
              name="jobLink"
              value={application.jobLink}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Date Applied
            </label>
            <input
              type="date"
              name="dateApplied"
              value={application.dateApplied}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Status</label>
            <select
              name="status"
              value={application.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="OA">OA</option>
              <option value="Interview">Interview</option>
              <option value="Final Interview">Final Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Resume Version
            </label>
            <input
              type="text"
              name="resumeVersion"
              value={application.resumeVersion}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Cover Letter Version
            </label>
            <input
              type="text"
              name="coverLetterVersion"
              value={application.coverLetterVersion}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-200">Notes</label>
          <textarea
            name="notes"
            value={application.notes}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90"
          >
            Save Changes
          </button>

          <Link
            href={`/applications/${application.id}`}
            className="rounded-xl bg-slate-800 px-5 py-3 font-medium text-white transition hover:bg-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}