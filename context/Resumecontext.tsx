"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Education {
  degree: string;
  school: string;
  year: string;
}

interface Experience {
  role: string;
  company: string;
  duration: string;
}

interface Project {
  title: string;
  description: string;
}

export interface ResumeData {
  github: string;
  profile: string;
  linkedin: string;
  name: string;
  email: string;
  phone: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: string[];
  languages: string[];
  hobbies: string[];
  skills: string[];
}

interface ResumeContextProps {
  data: ResumeData;
  setData: (data: ResumeData) => void;
  loadTemplate: (template: Partial<ResumeData>) => void;
  resetResume: () => void;
}

// ✅ Default resume structure (safe fallback)
const defaultResume: ResumeData = {
  name: "John Doe",
  email: "johndoe@email.com",
  phone: "+91 9876543210",
  github: "github.com/johndoe",
  linkedin: "linkedin.com/in/johndoe",
  profile:
    "Creative student passionate about web design, MERN stack, and video editing.",
  education: [
    { degree: "MCA", school: "CHARUSAT University", year: "2023–2025" },
    { degree: "BCA", school: "CHARUSAT University", year: "2020–2023" },
  ],
  experience: [
    { role: "Intern", company: "Teachnook", duration: "2 months" },
  ],
  projects: [
    { title: "Portfolio Website", description: "Built with Next.js and Tailwind." },
  ],
  certifications: ["AWS Cloud Practitioner", "ReactJS Advanced"],
  languages: ["English", "Hindi", "Gujarati"],
  hobbies: ["Cricket", "Photography", "Traveling"],
  skills: ["Web Design", "Video Editing", "Django / React / MERN"],
};

const ResumeContext = createContext<ResumeContextProps | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ResumeData>(defaultResume);

  // ✅ Load template (admin JSON → state merge)
  const loadTemplate = (template: Partial<ResumeData>) => {
    setData({ ...defaultResume, ...template });
  };

  // ✅ Reset to defaults
  const resetResume = () => {
    setData(defaultResume);
  };

  return (
    <ResumeContext.Provider value={{ data, setData, loadTemplate, resetResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used inside ResumeProvider");
  return ctx;
}
