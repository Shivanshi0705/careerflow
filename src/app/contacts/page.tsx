"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const storedContacts = JSON.parse(
      localStorage.getItem("contacts") || "[]"
    );

    setContacts(storedContacts.length > 0 ? storedContacts : mockContacts);
  }, []);

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    const updatedContacts = contacts.filter((contact) => contact.id !== id);

    setContacts(updatedContacts);
    localStorage.setItem("contacts", JSON.stringify(updatedContacts));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
          <p className="mt-2 text-slate-400">
            Keep track of recruiters, referrals, and networking conversations.
          </p>
        </div>

        <Link
          href="/contacts/new"
          className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
        >
          Add Contact
        </Link>
      </div>

      <div className="grid gap-4">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">
                    {contact.name}
                  </h2>
                  <p className="text-slate-400">
                    {contact.role} at {contact.company}
                  </p>
                  <p className="text-sm text-slate-300">{contact.email}</p>

                  {contact.linkedin && (
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-blue-400 underline"
                    >
                      LinkedIn
                    </a>
                  )}

                  <p className="text-sm text-slate-400">
                    Last contact: {contact.lastContact}
                  </p>

                  {contact.notes && (
                    <p className="pt-2 text-sm text-slate-300">
                      {contact.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-700"
                  >
                    View
                  </Link>

                  <Link
                    href={`/contacts/${contact.id}/edit`}
                    className="rounded-xl bg-amber-600 px-4 py-2 text-white transition hover:bg-amber-500"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            No contacts added yet.
          </div>
        )}
      </div>
    </div>
  );
}