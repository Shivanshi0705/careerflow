"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { applications as mockApplications } from "@/data/mockApplications";
import type { Application, UploadedDocument } from "@/types/application";

export default function ApplicationDetailPage() {
  const params = useParams();
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
    </div>
  );
}