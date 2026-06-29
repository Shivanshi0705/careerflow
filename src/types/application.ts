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

export type TailoredBullet = {
  originalBulletId: string;
  original: string;
  rewritten: string;
  relevanceScore: number;
  reasoning: string;
};

export type TailoredResult = {
  tailoredBullets: TailoredBullet[];
  missingKeywords: string[];
  generatedAt: string;
  jobDescriptionSnapshot: string;
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
  jobDescription?: string;
  tailoredResult?: TailoredResult | null;
};