export type ProgramCategory =
  | "scholarship"
  | "startup"
  | "farmer"
  | "healthcare"
  | "housing"
  | "skill"
  | "employment"
  | "welfare"
  | "women"
  | "insurance";

export type Program = {
  id: string;
  title: string;
  ministry: string;
  category: ProgramCategory;
  description: string;
  benefits: string;
  benefitsDetail: string[];
  eligibility: string[];
  deadline: string;
  source: string;
  officialUrl: string;
  applyUrl: string;
  /** empty array = pan-India */
  states: string[];
  /** persona tags: student, farmer, woman, sc_st, minority, youth, senior, msme, startup, rural, urban, family */
  targetGroups: string[];
  tags: string[];
};

export type UserProfile = {
  persona?: string;
  state?: string;
  district?: string;
  age?: string;
  education?: string;
  income?: string;
  occupation?: string;
  note?: string;
  updatedAt?: number;
};

export type DocCategory =
  | "identity"
  | "education"
  | "financial"
  | "healthcare"
  | "certificates"
  | "images"
  | "other";

export type DocAnalysis = {
  status: "pending" | "ready" | "error" | "unsupported";
  updatedAt?: number;
  /** Raw model response, if any */
  raw?: string;
  /** Parsed sections */
  summary?: string;
  detected?: Record<string, string>;
  importantDates?: { label: string; date: string }[];
  keyDocuments?: string[];
  recommendations?: string[];
  suggestedOpportunities?: string[];
  missingDocuments?: string[];
  confidence?: number;
  error?: string;
};

export type SavedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  category: DocCategory;
  uploadedAt: number;
  modifiedAt: number;
  favorite?: boolean;
  lastOpenedAt?: number;
  blob: Blob;
  analysis?: DocAnalysis;
};

export const PROGRAM_CATEGORY_LABEL: Record<ProgramCategory, string> = {
  scholarship: "Scholarships",
  startup: "Startup & MSME",
  farmer: "Farmer Support",
  healthcare: "Healthcare",
  housing: "Housing",
  skill: "Skill Development",
  employment: "Employment",
  welfare: "Welfare",
  women: "Women & Child",
  insurance: "Insurance & Pension",
};