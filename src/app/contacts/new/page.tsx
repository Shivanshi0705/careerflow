"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { contacts as mockContacts } from "@/data/mockContacts";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const storedContacts = JSON.parse(
      localStorage.getItem("contacts") || "[]"
    );

    const baseContacts =
      storedContacts.length > 0 ? storedContacts : mockContacts;

    const newContact = {
      id: Date.now(),
      name: formData.name,
      company: formData.company,
      role: formData.role,
      email: formData.email,
      linkedin: formData.linkedin,
      lastContact: formData.lastContact,
      notes: formData.notes,
    };

    const updatedContacts = [...baseContacts, newContact];

    localStorage.setItem("contacts", JSON.stringify(updatedContacts));
    router.push("/contacts");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Add Contact</h1>
        <p className="mt-2 text-slate-400">
          Add a recruiter, referral, or networking contact.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-700 bg-slate-900 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              LinkedIn URL
            </label>
            <input
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Last Contact Date
            </label>
            <input
              type="date"
              name="lastContact"
              value={formData.lastContact}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
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
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white"
          >
            Save Contact
          </button>

          <button
            type="button"
            onClick={() => router.push("/contacts")}
            className="rounded-xl border border-slate-600 px-5 py-3 text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}