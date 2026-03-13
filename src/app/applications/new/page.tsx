"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applications as mockApplications } from "@/data/mockApplications";

export default function NewApplicationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    jobLink: "",
    dateApplied: "",
    status: "Saved",
    resumeVersion: "",
    coverLetterVersion: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const storedApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );

    const baseApplications =
      storedApplications.length > 0 ? storedApplications : mockApplications;

    const newApplication = {
      id: Date.now(),
      company: formData.company,
      role: formData.role,
      location: formData.location,
      jobLink: formData.jobLink,
      dateApplied: formData.dateApplied,
      status: formData.status,
      resumeVersion: formData.resumeVersion,
      coverLetterVersion: formData.coverLetterVersion,
      notes: formData.notes,
    };

    const updatedApplications = [...baseApplications, newApplication];

    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    router.push("/applications");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Add Application</h1>
        <p className="mt-2 text-slate-400">
          Add a new internship or job application to your tracker.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-200">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
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
              value={formData.role}
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
              value={formData.location}
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
              value={formData.jobLink}
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
              value={formData.dateApplied}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Status</label>
            <select
              name="status"
              value={formData.status}
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
              value={formData.resumeVersion}
              onChange={handleChange}
              placeholder="Resume V3"
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
              value={formData.coverLetterVersion}
              onChange={handleChange}
              placeholder="CL Google V1"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-200">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={5}
            placeholder="Anything important about this application..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90"
        >
          Save Application
        </button>
      </form>
    </div>
  );
}