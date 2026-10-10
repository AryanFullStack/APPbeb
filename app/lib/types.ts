export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Full-time, permanent"
  | string;

export type WorkMode = "On-site" | "Hybrid" | "Remote" | string;

export type Job = {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  category: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  publishedAt: string;
  source: string;
  applicationUrl: string;
  description: string;
  skills: string[];
  isVerified: boolean;
  isPreview: boolean;
  imageUrl?: string;
  salary?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  icon?: "briefcase" | "code" | "heart" | "truck" | "box" | "store";
  count?: string;
};

export type CareerGuide = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  content: string;
  sections?: Array<{ heading: string; content: string }>;
};

export type Resume = {
  id: string;
  updatedAt: string;
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    role: string;
    company: string;
    dates: string;
    details: string;
  }>;
  education: Array<{
    school: string;
    qualification: string;
    dates: string;
  }>;
  skills: string[];
};

export type AiToolKey =
  | "resume"
  | "matcher"
  | "cover-letter"
  | "interview"
  | "resume-summary"
  | "resume-bullet";
