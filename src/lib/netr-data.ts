import {
  GraduationCap,
  Briefcase,
  Rocket,
  Wheat,
  HeartPulse,
  BookOpen,
  Home,
  Lightbulb,
  Users,
  Building2,
  UserRound,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type Persona = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export const personas: Persona[] = [
  { id: "student", title: "Student", description: "Scholarships, fellowships and learning support designed for your journey.", icon: GraduationCap, accent: "from-saffron/30 to-saffron-glow/20" },
  { id: "farmer", title: "Farmer", description: "Subsidies, insurance and farm-tech programs that protect your harvest.", icon: Wheat, accent: "from-leaf/30 to-saffron/10" },
  { id: "job-seeker", title: "Job Seeker", description: "Skilling, apprenticeships and employment programs to open new doors.", icon: Briefcase, accent: "from-sky/25 to-leaf/15" },
  { id: "woman-entrepreneur", title: "Woman Entrepreneur", description: "Grants, mentorship and capital support built for women-led businesses.", icon: UserRound, accent: "from-saffron-glow/30 to-saffron/15" },
  { id: "startup-founder", title: "Startup Founder", description: "Seed grants, incubators and tax benefits to take your idea further.", icon: Rocket, accent: "from-sky/30 to-saffron/15" },
  { id: "small-business", title: "Small Business Owner", description: "MSME schemes, credit support and tools to help your business grow.", icon: Building2, accent: "from-leaf/25 to-saffron-glow/15" },
  { id: "senior", title: "Senior Citizen", description: "Pensions, healthcare and welfare programs for a dignified life.", icon: Users, accent: "from-saffron/20 to-leaf/15" },
  { id: "other", title: "Someone Else", description: "Explore freely across every category — there's something for everyone.", icon: Sparkles, accent: "from-saffron-glow/25 to-sky/15" },
];

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  blurb: string;
};

export const categories: Category[] = [
  { id: "scholarships", name: "Scholarships", icon: GraduationCap, blurb: "For students at every stage" },
  { id: "jobs", name: "Jobs & Skilling", icon: Briefcase, blurb: "Employment & apprenticeships" },
  { id: "startup", name: "Startup Grants", icon: Rocket, blurb: "Seed funding & incubation" },
  { id: "farmer", name: "Farmer Support", icon: Wheat, blurb: "Subsidies & crop insurance" },
  { id: "healthcare", name: "Healthcare", icon: HeartPulse, blurb: "Medical cover & wellness" },
  { id: "education", name: "Education", icon: BookOpen, blurb: "Beyond scholarships" },
  { id: "housing", name: "Housing", icon: Home, blurb: "Shelter for every family" },
  { id: "skills", name: "Skill Development", icon: Lightbulb, blurb: "Learn, certify, grow" },
];

export type Opportunity = {
  id: string;
  title: string;
  provider: string;
  category: string;
  audience: string;
  amount: string;
  deadline: string;
  summary: string;
  tags: string[];
};

export const opportunities: Opportunity[] = [
  { id: "nmms", title: "National Means-cum-Merit Scholarship", provider: "Ministry of Education", category: "scholarships", audience: "Class 9–12 students", amount: "₹12,000 / year", deadline: "Rolling", summary: "Financial assistance for meritorious students from economically weaker sections to continue secondary education.", tags: ["Student", "Merit", "Need-based"] },
  { id: "pmkvy", title: "PM Kaushal Vikas Yojana", provider: "Ministry of Skill Development", category: "skills", audience: "Youth aged 15–45", amount: "Free training + certificate", deadline: "Open", summary: "Short-term, industry-aligned skill training across 250+ job roles with placement assistance.", tags: ["Skilling", "Free", "Placement"] },
  { id: "startup-india-seed", title: "Startup India Seed Fund", provider: "DPIIT", category: "startup", audience: "DPIIT-recognized startups", amount: "Up to ₹50 lakh", deadline: "Quarterly", summary: "Financial assistance to early-stage startups for proof of concept, prototype, product trials and commercialization.", tags: ["Founder", "Seed", "Equity-free"] },
  { id: "pmkisan", title: "PM Kisan Samman Nidhi", provider: "Ministry of Agriculture", category: "farmer", audience: "Landholding farmer families", amount: "₹6,000 / year", deadline: "Ongoing", summary: "Direct income support transferred in three equal installments to support input costs.", tags: ["Farmer", "Income", "DBT"] },
  { id: "ayushman", title: "Ayushman Bharat PM-JAY", provider: "National Health Authority", category: "healthcare", audience: "Eligible families", amount: "₹5 lakh cover / family", deadline: "Always-on", summary: "Cashless secondary and tertiary care hospitalization at empaneled hospitals across the country.", tags: ["Health", "Family", "Cashless"] },
  { id: "pmay", title: "Pradhan Mantri Awas Yojana", provider: "Ministry of Housing", category: "housing", audience: "First-time home buyers", amount: "Interest subsidy up to ₹2.67L", deadline: "Phase active", summary: "Credit-linked subsidy on home loans for economically weaker, low and middle income groups.", tags: ["Housing", "Subsidy", "First-time"] },
  { id: "stand-up-india", title: "Stand-Up India", provider: "SIDBI", category: "startup", audience: "Women & SC/ST entrepreneurs", amount: "₹10L – ₹1 crore loan", deadline: "Rolling", summary: "Bank loans for greenfield enterprises in manufacturing, services or trading sectors.", tags: ["Woman", "Loan", "Enterprise"] },
  { id: "inspire", title: "INSPIRE Scholarship", provider: "Department of Science & Technology", category: "scholarships", audience: "Top 1% science students", amount: "₹80,000 / year", deadline: "Annual", summary: "Scholarship for higher education in natural and basic sciences to attract talent into research.", tags: ["Science", "Research", "Merit"] },
  { id: "mudra", title: "PM MUDRA Yojana", provider: "MUDRA Ltd.", category: "jobs", audience: "Micro entrepreneurs", amount: "Up to ₹10 lakh", deadline: "Open", summary: "Collateral-free loans for non-corporate, non-farm small and micro enterprises under Shishu, Kishore and Tarun.", tags: ["MSME", "Loan", "Self-employed"] },
  { id: "nrega", title: "MGNREGA Wage Employment", provider: "Ministry of Rural Development", category: "jobs", audience: "Rural adult households", amount: "100 days / household", deadline: "Always-on", summary: "Guaranteed wage employment in rural areas to enhance livelihood security.", tags: ["Rural", "Wage", "Guarantee"] },
  { id: "post-matric-sc", title: "Post-Matric Scholarship for SC", provider: "Ministry of Social Justice", category: "scholarships", audience: "SC students post Class 10", amount: "Fee + maintenance", deadline: "Annual", summary: "Fee reimbursement and maintenance allowance for SC students pursuing post-matric education.", tags: ["SC", "Need-based", "Fee"] },
  { id: "atal-pension", title: "Atal Pension Yojana", provider: "PFRDA", category: "healthcare", audience: "Unorganised workers 18–40", amount: "₹1,000–₹5,000 / month", deadline: "Open", summary: "Guaranteed monthly pension post-60 with co-contribution from the government for early subscribers.", tags: ["Senior", "Pension", "Long-term"] },
];

export const suggestedQuestions = [
  "What scholarships exist for me?",
  "What startup grants are available?",
  "Which schemes support farmers?",
  "How can I improve my eligibility?",
  "Show healthcare benefits for my family",
  "I'm a first-time home buyer — what helps?",
];
