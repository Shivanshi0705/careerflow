"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  FileText,
  Upload,
  Link as LinkIcon,
  MapPin,
  CalendarDays,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { getStoredApplications, saveApplications } from "@/lib/applicationStorage";
import type {
  Application,
  ApplicationStatus,
  UploadedDocument,
} from "@/types/application";

export default function NewApplicationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    jobLink: "",
    dateApplied: "",
    status: "Saved" as ApplicationStatus,
    resumeVersion: "",
    coverLetterVersion: "",
    notes: "",
  });

  const [resume, setResume] = useState<UploadedDocument | null>(null);
  const [coverLetter, setCoverLetter] = useState<UploadedDocument | null>(null);
  const [fileError, setFileError] = useState("");

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

      if (type === "resume") {
        setResume(uploadedFile);
      } else {
        setCoverLetter(uploadedFile);
      }
    } catch (error) {
      console.error("File upload error:", error);
      setFileError("Something went wrong while uploading the file.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const existingApplications = getStoredApplications();

      const newApplication: Application = {
        id: Date.now(),
        company: formData.company.trim(),
        role: formData.role.trim(),
        location: formData.location.trim(),
        jobLink: formData.jobLink.trim(),
        dateApplied: formData.dateApplied,
        status: formData.status,
        resumeVersion: formData.resumeVersion.trim(),
        coverLetterVersion: formData.coverLetterVersion.trim(),
        notes: formData.notes.trim(),
        resume,
        coverLetter,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedApplications = [...existingApplications, newApplication];
      saveApplications(updatedApplications);

      router.push("/applications");
      router.refresh();
    } catch (error) {
      console.error("Failed to save application:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] px-6 py-8 shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              New application entry
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Add Application
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Add a new internship or job application to your tracker with role
              details, files, and notes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/applications")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl"
      >
        <div>
          <h2 className="text-xl font-semibold text-white">Role Details</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Core information about the role you are applying to.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
              <BriefcaseBusiness className="h-4 w-4 text-zinc-500" />
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
              <FileText className="h-4 w-4 text-zinc-500" />
              Role
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
              <MapPin className="h-4 w-4 text-zinc-500" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
              <LinkIcon className="h-4 w-4 text-zinc-500" />
              Job Link
            </label>
            <input
              type="url"
              name="jobLink"
              value={formData.jobLink}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
              <CalendarDays className="h-4 w-4 text-zinc-500" />
              Date Applied
            </label>
            <input
              type="date"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 block text-sm text-zinc-300">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
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
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Documents</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Track uploaded files and the version names you used.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 block text-sm text-zinc-300">
              Resume Version
            </label>
            <input
              type="text"
              name="resumeVersion"
              value={formData.resumeVersion}
              onChange={handleChange}
              placeholder="Resume V3"
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 block text-sm text-zinc-300">
              Cover Letter Version
            </label>
            <input
              type="text"
              name="coverLetterVersion"
              value={formData.coverLetterVersion}
              onChange={handleChange}
              placeholder="CL Google V1"
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
              <Upload className="h-4 w-4 text-zinc-500" />
              Upload Resume (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e, "resume")}
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
            />
            {resume && (
              <p className="mt-3 text-sm text-emerald-300">
                Uploaded: {resume.fileName}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
              <Upload className="h-4 w-4 text-zinc-500" />
              Upload Cover Letter (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e, "coverLetter")}
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
            />
            {coverLetter && (
              <p className="mt-3 text-sm text-emerald-300">
                Uploaded: {coverLetter.fileName}
              </p>
            )}
          </div>
        </div>

        {fileError && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {fileError}
          </div>
        )}

        <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
          <label className="mb-2 block text-sm text-zinc-300">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={5}
            placeholder="Anything important about this application..."
            className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-white px-5 py-3 font-medium text-black transition duration-200 hover:scale-[1.02] hover:opacity-95"
          >
            Save Application
          </button>

          <button
            type="button"
            onClick={() => router.push("/applications")}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white transition hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}