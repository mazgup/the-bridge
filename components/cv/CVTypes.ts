// ============================================================
// CVData — The Master Schema (PRD v3.0)
// This is the SINGLE source of truth for all CV data.
// The AI outputs this. The PDF templates consume this.
// ============================================================

export type TemplateType = "oxford" | "modern";

export interface CVLink {
  label: string;
  url: string;
}

export interface CVPersonal {
  name: string;
  contact: string[];  // e.g. ["London, UK", "07731671258", "mazgup@gmail.com"]
  links: CVLink[];    // e.g. [{ label: "LinkedIn", url: "..." }]
}

export interface CVEducation {
  institution: string;
  qualification: string;
  date_range: string;
  grade?: string;
}

export interface CVExperience {
  company: string;
  role: string;
  date_range: string;
  location: string;
  bullets: string[];
}

export interface CVProject {
  name: string;
  description: string;
  technologies?: string[];
  date_range?: string;
  bullets: string[];
}

export interface CVSkillGroup {
  category: string;   // "Technical", "Languages", "Soft Skills"
  items: string[];
}

export interface CVContent {
  personal: CVPersonal;
  summary: string;
  education: CVEducation[];
  experience: CVExperience[];
  projects: CVProject[];
  skills: CVSkillGroup[];
}

export interface CVMeta {
  template: TemplateType;
  explanation: string;  // AI explains "why" for the user
  target_role: string;
  target_industry: string;
  experience_level: "junior" | "mid" | "senior" | "executive" | "unknown";
  target_pages: 1 | 2;
  cv_style: "experience" | "skills" | "hybrid"; // AI decides
}

export interface CVData {
  meta: CVMeta;
  content: CVContent;
}

// ============================================================
// Initial state — empty CV
// ============================================================
export const INITIAL_CV_DATA: CVData = {
  meta: {
    template: "oxford",
    explanation: "",
    target_role: "",
    target_industry: "",
    experience_level: "unknown",
    target_pages: 1,
    cv_style: "hybrid",
  },
  content: {
    personal: {
      name: "",
      contact: [],
      links: [],
    },
    summary: "",
    education: [],
    experience: [],
    projects: [],
    skills: [],
  },
};

// ============================================================
// Backward Compatibility — DO NOT USE IN NEW CODE
// These aliases exist ONLY so Dashboard, ReturnHub, etc. don't break
// ============================================================
export interface CVProfile {
  personal_info: {
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    website?: string;
  };
  targetRole?: string;
  summary: string;
  experience: {
    id: string;
    company: string;
    role: string;
    start_date: string;
    end_date: string;
    location?: string;
    bullets: string[];
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    start_date?: string;
    end_date?: string;
    grade?: string;
    institution?: string;
    field?: string;
  }[];
  skills: string[];
  projects?: {
    id: string;
    name: string;
    description: string;
    year?: string;
    outcome?: string;
  }[];
}

export const INITIAL_CV_PROFILE: CVProfile = {
  personal_info: { name: "", email: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
};