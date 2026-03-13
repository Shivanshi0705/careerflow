export type Contact = {
  id: number;
  name: string;
  company: string;
  role: string;
  email: string;
  linkedin?: string;
  lastContact: string;
  notes?: string;
};

export const contacts: Contact[] = [
  {
    id: 1,
    name: "Anjali Sharma",
    company: "Coca-Cola",
    role: "Customer Solutions Manager",
    email: "anjali@example.com",
    linkedin: "https://linkedin.com/in/anjali-sharma",
    lastContact: "2026-03-01",
    notes: "Had a coffee chat about customer solutions and recruiting.",
  },
  {
    id: 2,
    name: "Sarah Lee",
    company: "Google",
    role: "Recruiter",
    email: "sarah@example.com",
    linkedin: "https://linkedin.com/in/sarah-lee",
    lastContact: "2026-02-26",
    notes: "Reached out after internship application.",
  },
];