"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getApplicationById,
  getStoredApplications,
  saveApplications,
  sortApplicationsByDate,
} from "@/lib/applicationStorage";
import type {
  Application,
  ApplicationStatus,
  UploadedDocument,
} from "@/types/application";

export default function EditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    const foundApplication = getApplicationById(id);
    setApplication(foundApplication || null);
    setLoading(false);
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!application) return;

    const { name, value } = e.target;

    setApplication((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : prev
    );
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!application) return;

    setApplication((prev) =>
      prev
        ? {
            ...prev,
            status: e.target.value as ApplicationStatus,
          }
        : prev
    );
  };

  const convertFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "coverLetter"
  ) => {
    if (!application) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      return;
    }

    setFileError("");

    try {
      const fileData = await convertFileToDataUrl(file);

      const uploadedFile: UploadedDocument = {
        fileName: file.name,
        fileType: file.type,
        fileData,
      };

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              [type]: uploadedFile,
            }
          : prev
      );
    } catch (error) {
      console.error("File upload error:", error);
      setFileError("Something went wrong while uploading the file.");
    }
  };

  const removeFile = (type: "resume" | "coverLetter") => {
    setApplication((prev) =>
      prev
        ? {
            ...prev,
            [type]: null,
          }
        : prev
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    const existingApplications = getStoredApplications();

    const updatedApplications = existingApplications.map((app) =>
      Number(app.id) === Number(application.id)
        ? {
            ...application,
            company: application.company.trim(),
            role: application.role.trim(),
            location: application.location?.trim() || "",
            jobLink: application.jobLink?.trim() || "",
            resumeVersion: application.resumeVersion?.trim() || "",
            coverLetterVersion: application.coverLetterVersion?.trim() || "",
            notes: application.notes?.trim() || "",
            updatedAt: new Date().toISOString(),
          }
        : app
    );

    const sortedApplications = sortApplicationsByDate(updatedApplications);
    saveApplications(sortedApplications);

    router.push(`/applications/${application.id}`);
    router.refresh();
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Location</label>
            <input
              type="text"
              name="location"
              value={application.location || ""}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Job Link</label>
            <input
              type="url"
              name="jobLink"
              value={application.jobLink || ""}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Status</label>
            <select
              value={application.status}
              onChange={handleStatusChange}
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
              value={application.resumeVersion || ""}
              onChange={handleInputChange}
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
              value={application.coverLetterVersion || ""}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <label className="mb-2 block text-sm text-slate-200">
              Replace Resume (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e, "resume")}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
            />

            {application.resume && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-emerald-400">
                  Current: {application.resume.fileName}
                </p>
                <button
                  type="button"
                  onClick={() => removeFile("resume")}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500"
                >
                  Remove Resume
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <label className="mb-2 block text-sm text-slate-200">
              Replace Cover Letter (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e, "coverLetter")}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
            />

            {application.coverLetter && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-emerald-400">
                  Current: {application.coverLetter.fileName}
                </p>
                <button
                  type="button"
                  onClick={() => removeFile("coverLetter")}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500"
                >
                  Remove Cover Letter
                </button>
              </div>
            )}
          </div>
        </div>

        {fileError && <p className="text-sm text-red-400">{fileError}</p>}

        <div>
          <label className="mb-2 block text-sm text-slate-200">Notes</label>
          <textarea
            name="notes"
            value={application.notes || ""}
            onChange={handleInputChange}
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