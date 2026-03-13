"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function ContactDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const storedContacts = JSON.parse(
      localStorage.getItem("contacts") || "[]"
    );

    const allContacts =
      storedContacts.length > 0 ? storedContacts : mockContacts;

    const foundContact = allContacts.find(
      (item: Contact) => item.id === Number(params.id)
    );

    if (foundContact) {
      setContact(foundContact);
    } else {
      setContact(null);
    }
  }, [params.id]);

  const handleDelete = () => {
    if (!contact) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    const storedContacts = JSON.parse(
      localStorage.getItem("contacts") || "[]"
    );

    const allContacts =
      storedContacts.length > 0 ? storedContacts : mockContacts;

    const updatedContacts = allContacts.filter(
      (item: Contact) => item.id !== contact.id
    );

    localStorage.setItem("contacts", JSON.stringify(updatedContacts));
    router.push("/contacts");
  };

  if (!contact) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
        Contact not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{contact.name}</h1>
          <p className="mt-2 text-slate-400">
            {contact.role} at {contact.company}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="rounded-xl bg-amber-600 px-5 py-3 font-medium text-white transition hover:bg-amber-500"
          >
            Edit
          </Link>

          <button
            onClick={handleDelete}
            className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="mt-1 text-white">{contact.email}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Last Contact</p>
            <p className="mt-1 text-white">{contact.lastContact}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Company</p>
            <p className="mt-1 text-white">{contact.company}</p>
          </div>

          <div>
            <p className="text-sm text-slate-400">Role</p>
            <p className="mt-1 text-white">{contact.role}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-slate-400">LinkedIn</p>
            {contact.linkedin ? (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-blue-400 underline"
              >
                {contact.linkedin}
              </a>
            ) : (
              <p className="mt-1 text-slate-500">No LinkedIn added.</p>
            )}
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-slate-400">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-white">
              {contact.notes || "No notes added."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}