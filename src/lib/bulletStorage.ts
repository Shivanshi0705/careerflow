import { bullets as mockBullets } from "@/data/mockBullets";
import type { BulletBankEntry } from "@/types/bullet";

const STORAGE_KEY = "careerflow_bullets";

function sortBulletsByUpdated(bullets: BulletBankEntry[]) {
  return [...bullets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getAllBullets(): BulletBankEntry[] {
  if (typeof window === "undefined") {
    return sortBulletsByUpdated(mockBullets);
  }

  try {
    const storedBullets = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    ) as BulletBankEntry[];

    const baseBullets = storedBullets.length > 0 ? storedBullets : mockBullets;

    return sortBulletsByUpdated(baseBullets);
  } catch {
    return sortBulletsByUpdated(mockBullets);
  }
}

function saveBullets(bullets: BulletBankEntry[]) {
  const sortedBullets = sortBulletsByUpdated(bullets);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedBullets));
  window.dispatchEvent(new Event("bulletsUpdated"));
}

export function getBulletById(id: string): BulletBankEntry | null {
  const bullets = getAllBullets();
  return bullets.find((bullet) => bullet.id === id) || null;
}

export function createBullet(
  input: Pick<BulletBankEntry, "text" | "experience" | "tags">
): BulletBankEntry {
  const now = new Date().toISOString();

  const newBullet: BulletBankEntry = {
    id: crypto.randomUUID(),
    text: input.text,
    experience: input.experience,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
  };

  saveBullets([...getAllBullets(), newBullet]);

  return newBullet;
}

export function updateBullet(
  id: string,
  input: Pick<BulletBankEntry, "text" | "experience" | "tags">
): BulletBankEntry | null {
  const bullets = getAllBullets();
  let updatedBullet: BulletBankEntry | null = null;

  const updatedBullets = bullets.map((bullet) => {
    if (bullet.id !== id) return bullet;

    updatedBullet = {
      ...bullet,
      text: input.text,
      experience: input.experience,
      tags: input.tags,
      updatedAt: new Date().toISOString(),
    };

    return updatedBullet;
  });

  if (!updatedBullet) {
    return null;
  }

  saveBullets(updatedBullets);
  return updatedBullet;
}

export function deleteBullet(id: string) {
  const bullets = getAllBullets();
  const updatedBullets = bullets.filter((bullet) => bullet.id !== id);
  saveBullets(updatedBullets);
}
