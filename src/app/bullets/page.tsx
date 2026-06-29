"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ListChecks,
  Plus,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import {
  createBullet,
  deleteBullet,
  getAllBullets,
  updateBullet,
} from "@/lib/bulletStorage";
import type { BulletBankEntry } from "@/types/bullet";

type BulletFormState = {
  text: string;
  experience: string;
  tags: string;
};

const emptyForm: BulletFormState = {
  text: "",
  experience: "",
  tags: "",
};

function parseTags(tagsInput: string): string[] {
  return tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export default function BulletsPage() {
  const [bullets, setBullets] = useState<BulletBankEntry[]>([]);
  const [search, setSearch] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BulletFormState>(emptyForm);

  useEffect(() => {
    const loadBullets = () => {
      setBullets(getAllBullets());
    };

    loadBullets();

    window.addEventListener("focus", loadBullets);
    window.addEventListener("storage", loadBullets);
    window.addEventListener("bulletsUpdated", loadBullets);

    return () => {
      window.removeEventListener("focus", loadBullets);
      window.removeEventListener("storage", loadBullets);
      window.removeEventListener("bulletsUpdated", loadBullets);
    };
  }, []);

  const experienceOptions = useMemo(() => {
    const experiences = new Set(bullets.map((bullet) => bullet.experience));
    return ["All", ...Array.from(experiences)];
  }, [bullets]);

  const tagOptions = useMemo(() => {
    const tags = new Set(bullets.flatMap((bullet) => bullet.tags));
    return Array.from(tags);
  }, [bullets]);

  const filteredBullets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bullets.filter((bullet) => {
      const matchesSearch =
        !query ||
        bullet.text.toLowerCase().includes(query) ||
        bullet.experience.toLowerCase().includes(query);

      const matchesExperience =
        experienceFilter === "All" || bullet.experience === experienceFilter;

      const matchesTag = !activeTag || bullet.tags.includes(activeTag);

      return matchesSearch && matchesExperience && matchesTag;
    });
  }, [bullets, search, experienceFilter, activeTag]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (bullet: BulletBankEntry) => {
    setEditingId(bullet.id);
    setFormData({
      text: bullet.text,
      experience: bullet.experience,
      tags: bullet.tags.join(", "),
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      text: formData.text.trim(),
      experience: formData.experience.trim(),
      tags: parseTags(formData.tags),
    };

    if (editingId) {
      updateBullet(editingId, input);
    } else {
      createBullet(input);
    }

    setBullets(getAllBullets());
    closeForm();
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bullet?"
    );

    if (!confirmed) return;

    deleteBullet(id);
    setBullets(getAllBullets());
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] px-6 py-8 shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              Master bullet bank
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white">
              Bullets
            </h1>

            <p className="mt-2 max-w-2xl text-zinc-400">
              Store every resume bullet you have ever written, tag it by
              experience and theme, and pull from it when tailoring resumes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition duration-200 hover:scale-[1.02] hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Add Bullet
            </button>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {editingId ? "Edit Bullet" : "New Bullet"}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Capture the bullet, the experience it belongs to, and a few
                tags to make it easy to find later.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
            <label className="mb-2 block text-sm text-zinc-300">
              Bullet Text
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Led a team of 5 analysts to..."
              className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
              <label className="mb-2 block text-sm text-zinc-300">
                Experience
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                placeholder="Bharti Airtel Internship"
                className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#141417] p-4">
              <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
                <Tag className="h-4 w-4 text-zinc-500" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="data analytics, leadership, SQL"
                className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-white px-5 py-3 font-medium text-black transition duration-200 hover:scale-[1.02] hover:opacity-95"
            >
              {editingId ? "Save Changes" : "Save Bullet"}
            </button>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-white/5 bg-[#1f1f23] p-5 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/5 bg-[#141417] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by bullet text or experience..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
            />
          </div>

          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/5 bg-[#141417] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 lg:w-[260px]"
          >
            {experienceOptions.map((experience) => (
              <option key={experience} value={experience}>
                {experience === "All" ? "Filter by experience" : experience}
              </option>
            ))}
          </select>
        </div>

        {tagOptions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
                activeTag === null
                  ? "bg-white text-black"
                  : "border border-white/5 bg-[#141417] text-zinc-300 hover:bg-white/5"
              }`}
            >
              All tags
            </button>

            {tagOptions.map((tag) => {
              const isActive = activeTag === tag;

              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(isActive ? null : tag)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-white text-black"
                      : "border border-white/5 bg-[#141417] text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {filteredBullets.length > 0 ? (
          filteredBullets.map((bullet) => (
            <div
              key={bullet.id}
              className="rounded-3xl border border-white/5 bg-[#1f1f23] p-6 shadow-xl"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-500">{bullet.experience}</p>
                  <p className="mt-2 leading-6 text-zinc-100">{bullet.text}</p>

                  {bullet.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {bullet.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 whitespace-nowrap">
                  <button
                    onClick={() => openEditForm(bullet)}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-violet-300 transition hover:bg-violet-500/20"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(bullet.id)}
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
              <ListChecks className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-xl font-semibold text-white">
              No bullets found
            </h3>

            <p className="mt-2 text-zinc-400">
              Try changing your search or filters, or add a new bullet to your
              bank.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Add Bullet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
