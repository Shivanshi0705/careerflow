"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  Loader2,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  getApplicationById,
  getStoredApplications,
  saveApplications,
} from "@/lib/applicationStorage";
import { getAllBullets } from "@/lib/bulletStorage";
import type {
  Application,
  TailoredResult,
  UploadedDocument,
} from "@/types/application";
import type { BulletBankEntry } from "@/types/bullet";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [bulletBank, setBulletBank] = useState<BulletBankEntry[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorError, setTailorError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const foundApplication = getApplicationById(id);
    setApplication(foundApplication || null);
    setJobDescription(foundApplication?.jobDescription || "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setBulletBank(getAllBullets());
  }, []);

  const persistApplication = (updates: Partial<Application>) => {
    if (!application) return;

    const updatedApplication: Application = {
      ...application,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const existingApplications = getStoredApplications();
    const updatedApplications = existingApplications.map((app) =>
      Number(app.id) === Number(updatedApplication.id) ? updatedApplication : app
    );

    saveApplications(updatedApplications);
    setApplication(updatedApplication);
  };

  const handleTailorBullets = async () => {
    if (!application || !jobDescription.trim() || isTailoring) return;

    setIsTailoring(true);
    setTailorError(null);

    try {
      const response = await fetch("/api/tailor-bullets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          bullets: bulletBank,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to tailor bullets.");
      }

      persistApplication({
        jobDescription: jobDescription.trim(),
        tailoredResult: data as TailoredResult,
      });
    } catch (error) {
      setTailorError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsTailoring(false);
    }
  };

  const handleCopy = async (bulletId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(bulletId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const formatRelativeTime = (iso: string): string => {
    const diffMinutes = Math.round(
      (Date.now() - new Date(iso).getTime()) / 60000
    );

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(",");
    const mimeMatch = parts[0].match(/data:(.*?);base64/);

    if (!mimeMatch || !parts[1]) {
      throw new Error("Invalid file data");
    }

    const mimeType = mimeMatch[1];
    const byteString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([uintArray], { type: mimeType });
  };

  const handleViewFile = (file: UploadedDocument) => {
    try {
      const blob = dataUrlToBlob(file.fileData);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error("Error viewing file:", error);
      alert("Could not open file.");
    }
  };

  const handleDownloadFile = (file: UploadedDocument) => {
    try {
      const blob = dataUrlToBlob(file.fileData);
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Could not download file.");
    }
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{application.company}</h1>
          <p className="mt-2 text-slate-400">{application.role}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/applications"
            className="rounded-xl bg-slate-800 px-4 py-3 font-medium text-white transition hover:bg-slate-700"
          >
            Back
          </Link>

          <Link
            href={`/applications/${application.id}/edit`}
            className="rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90"
          >
            Edit Application
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Company</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {application.company}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Role</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {application.role}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Location</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {application.location || "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Status</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {application.status}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Date Applied</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {application.dateApplied || "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Resume Version</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {application.resumeVersion || "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Cover Letter Version</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {application.coverLetterVersion || "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Job Posting</p>
          {application.jobLink ? (
            <a
              href={application.jobLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-lg font-semibold text-blue-400 underline"
            >
              Open Job Link
            </a>
          ) : (
            <p className="mt-2 text-lg font-semibold text-white">-</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Resume File</p>

          {application.resume ? (
            <div className="mt-3 space-y-3">
              <p className="text-white">{application.resume.fileName}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleViewFile(application.resume!)}
                  className="rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:opacity-90"
                >
                  View Resume
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadFile(application.resume!)}
                  className="rounded-xl bg-slate-800 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
                >
                  Download
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-white">No resume uploaded.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Cover Letter File</p>

          {application.coverLetter ? (
            <div className="mt-3 space-y-3">
              <p className="text-white">{application.coverLetter.fileName}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleViewFile(application.coverLetter!)}
                  className="rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:opacity-90"
                >
                  View Cover Letter
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadFile(application.coverLetter!)}
                  className="rounded-xl bg-slate-800 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
                >
                  Download
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-white">No cover letter uploaded.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Notes</p>
        <p className="mt-3 whitespace-pre-line text-white">
          {application.notes || "No notes added yet."}
        </p>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-assisted
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Tailor Resume Bullets
            </h2>
            <p className="mt-1 max-w-2xl text-zinc-400">
              Paste this role&apos;s job description to pull the most relevant
              bullets from your bank, rewritten to match its language.
            </p>
          </div>

          {application.tailoredResult && (
            <div className="flex items-center gap-2 whitespace-nowrap text-sm text-zinc-500">
              <Clock className="h-4 w-4" />
              Last tailored{" "}
              {formatRelativeTime(application.tailoredResult.generatedAt)}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-white/5 bg-[#141417] p-4">
          <label className="mb-2 block text-sm text-zinc-300">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste the job description here..."
            className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        {bulletBank.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/5 bg-[#141417] p-6 text-center">
            <p className="text-zinc-300">
              Your bullet bank is empty, so there is nothing to tailor yet.
            </p>
            <Link
              href="/bullets"
              className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Go to Bullet Bank
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTailorBullets}
              disabled={!jobDescription.trim() || isTailoring}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition duration-200 hover:scale-[1.02] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isTailoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isTailoring
                ? "Tailoring..."
                : application.tailoredResult
                ? "Re-tailor"
                : "Tailor Bullets"}
            </button>
          </div>
        )}

        {tailorError && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {tailorError}
          </div>
        )}

        {application.tailoredResult && (
          <div className="mt-6 space-y-4">
            {application.tailoredResult.missingKeywords.length > 0 && (
              <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
                <p className="mb-3 flex items-center gap-2 text-sm text-zinc-300">
                  <Tag className="h-4 w-4 text-zinc-500" />
                  Keywords missing from your tailored bullets
                </p>
                <div className="flex flex-wrap gap-2">
                  {application.tailoredResult.missingKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {application.tailoredResult.tailoredBullets.map((bullet) => (
                <div
                  key={bullet.originalBulletId}
                  className="rounded-2xl border border-white/5 bg-[#141417] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                      Relevance: {bullet.relevanceScore}/100
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(bullet.originalBulletId, bullet.rewritten)
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                    >
                      {copiedId === bullet.originalBulletId ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedId === bullet.originalBulletId ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Original
                      </p>
                      <p className="mt-2 leading-6 text-zinc-400">
                        {bullet.original}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Rewritten
                      </p>
                      <p className="mt-2 leading-6 text-zinc-100">
                        {bullet.rewritten}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-zinc-500">{bullet.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}