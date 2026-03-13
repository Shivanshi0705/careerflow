export type ReferralStatus = "None" | "Requested" | "Received";

export interface Contact {
  id: string;
  name: string;
  company: string;
  title: string;
  platform: string;
  dateContacted: string;
  followUpDate: string;
  referralStatus: ReferralStatus;
  notes: string;
}