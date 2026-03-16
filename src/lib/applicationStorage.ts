import { applications as mockApplications } from "@/data/mockApplications";
import type { Application } from "@/types/application";

function getSafeDate(dateString?: string) {
  const date = new Date(dateString || "");
  return isNaN(date.getTime()) ? 0 : date.getTime();
}

export function sortApplicationsByDate(applications: Application[]) {
  return [...applications].sort(
    (a, b) => getSafeDate(b.dateApplied) - getSafeDate(a.dateApplied)
  );
}

export function getStoredApplications(): Application[] {
  if (typeof window === "undefined") {
    return sortApplicationsByDate(mockApplications);
  }

  try {
    const storedApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    ) as Application[];

    const baseApplications =
      storedApplications.length > 0 ? storedApplications : mockApplications;

    return sortApplicationsByDate(baseApplications);
  } catch {
    return sortApplicationsByDate(mockApplications);
  }
}

export function saveApplications(applications: Application[]) {
  const sortedApplications = sortApplicationsByDate(applications);
  localStorage.setItem("applications", JSON.stringify(sortedApplications));
  window.dispatchEvent(new Event("applicationsUpdated"));
}

export function getApplicationById(id: number): Application | null {
  const applications = getStoredApplications();
  return applications.find((application) => Number(application.id) === id) || null;
}