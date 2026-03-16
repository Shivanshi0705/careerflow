"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { contacts as mockContacts } from "@/data/mockContacts";

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

export default function NewContactPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "",
    email: "",
    linkedin: "",
    lastContact: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const storedContacts = JSON.parse(localStorage.getItem("contacts") || "[]");
    const existingContacts =
      storedContacts.length > 0 ? storedContacts : mockContacts;

    const newContact: Contact = {
      id: Date.now(),
      name: formData.name.trim(),
      company: formData.company.trim(),
      role: formData.role.trim(),
      email: formData.email.trim(),
      linkedin: formData.linkedin.trim() || undefined,
      lastContact: formData.lastContact || new Date().toISOString(),
      notes: formData.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedContacts = sortContactsByNewest([
      ...existingContacts,
      newContact,
    ]);

    localStorage.setItem("contacts", JSON.stringify(updatedContacts));
    window.dispatchEvent(new Event("contactsUpdated"));

    router.push("/contacts");
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] px-6 py-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              Add to your network
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white">
              New Contact
            </h1>

            <p className="mt-2 max-w-2xl text-zinc-400">
              Add a recruiter, mentor, referral, or networking connection to
              your tracker.
            </p>
          </div>

          <Link
            href="/contacts"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Name
              </label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Anjali Sharma"
                className="w-full rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Company
              </label>
              <input
                name="company"
                type="text"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="Google"
                className="w-full rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Role
              </label>
              <input
                name="role"
                type="text"
                required
                value={formData.role}
                onChange={handleChange}
                placeholder="Recruiter"
                className="w-full rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                LinkedIn
              </label>
              <input
                name="linkedin"
                type="text"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn profile URL"
                className="w-full rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Last Contact Date
              </label>
              <input
                name="lastContact"
                type="date"
                value={formData.lastContact}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Notes
            </label>
            <textarea
              name="notes"
              rows={5}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Met at a networking event, discussed internship recruiting, follow up in two weeks..."
              className="w-full rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Save Contact
            </button>

            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}