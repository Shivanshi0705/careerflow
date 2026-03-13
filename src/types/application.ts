export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "OA"
  | "Interview"
  | "Final Interview"
  | "Offer"
  | "Rejected";

export interface Application {
  id: number;
  company: string;
  role: string;
  location: string;
  jobLink: string;
  dateApplied: string;
  status: ApplicationStatus;
  resumeVersion: string;
  coverLetterVersion: string;
  notes: string;
}