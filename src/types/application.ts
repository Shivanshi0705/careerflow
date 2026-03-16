export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "OA"
  | "Interview"
  | "Final Interview"
  | "Offer"
  | "Rejected";

export type UploadedDocument = {
  fileName: string;
  fileType: string;
  fileData: string;
};

export type Application = {
  id: number;
  company: string;
  role: string;
  location?: string;
  jobLink?: string;
  dateApplied: string;
  status: ApplicationStatus;
  resumeVersion?: string;
  coverLetterVersion?: string;
  notes?: string;
  resume?: UploadedDocument | null;
  coverLetter?: UploadedDocument | null;
  createdAt?: string;
  updatedAt?: string;
};