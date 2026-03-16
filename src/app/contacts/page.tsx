"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Building2,
  Clock3,
  Search,
  Sparkles,
} from "lucide-react";
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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadContacts = () => {
      const storedContacts = JSON.parse(localStorage.getItem("contacts") || "[]");
      const sourceContacts =
        storedContacts.length > 0 ? storedContacts : mockContacts;

      setContacts(sortContactsByNewest(sourceContacts));
    };

    loadContacts();

    window.addEventListener("focus", loadContacts);
    window.addEventListener("storage", loadContacts);
    window.addEventListener("contactsUpdated", loadContacts);

    return () => {
      window.removeEventListener("focus", loadContacts);
      window.removeEventListener("storage", loadContacts);
      window.removeEventListener("contactsUpdated", loadContacts);
    };
  }, []);

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    const updatedContacts = sortContactsByNewest(
      contacts.filter((contact) => contact.id !== id)
    );

    setContacts(updatedContacts);
    localStorage.setItem("contacts", JSON.stringify(updatedContacts));
    window.dispatchEvent(new Event("contactsUpdated"));
  };

  const filteredContacts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return contacts.filter((contact) => {
      const name = contact.name?.toLowerCase() || "";
      const company = contact.company?.toLowerCase() || "";
      const role = contact.role?.toLowerCase() || "";
      const email = contact.email?.toLowerCase() || "";

      return (
        name.includes(query) ||
        company.includes(query) ||
        role.includes(query) ||
        email.includes(query)
      );
    });
  }, [contacts, search]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] px-6 py-8 shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              Networking tracker
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white">
              Contacts
            </h1>

            <p className="mt-2 max-w-2xl text-zinc-400">
              Keep track of recruiters, referrals, mentors, and networking
              conversations in one place.
            </p>
          </div>

          <Link
            href="/contacts/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition duration-200 hover:scale-[1.02] hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-5 transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Contacts</p>
              <p className="mt-3 text-5xl font-bold text-white">
                {contacts.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/90">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-5 transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Companies</p>
              <p className="mt-3 text-5xl font-bold text-white">
                {new Set(contacts.map((contact) => contact.company)).size}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/90">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-5 transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Showing</p>
              <p className="mt-3 text-5xl font-bold text-white">
                {filteredContacts.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/90">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-5 shadow-xl">
        <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/5 bg-[#141417] px-4 py-3">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, company, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {contact.name}
                  </h2>
                  <p className="mt-1 text-zinc-400">{contact.role}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {contact.company}
                  </p>
                </div>

                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-300 transition hover:bg-blue-500/20"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>

                  <Link
                    href={`/contacts/${contact.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-violet-300 transition hover:bg-violet-500/20"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-10 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-[#141417] text-zinc-400">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-xl font-semibold text-white">
              No contacts found
            </h3>

            <p className="mt-2 text-zinc-400">
              Add a recruiter, mentor, or referral contact to start building your
              network tracker.
            </p>

            <Link
              href="/contacts/new"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}