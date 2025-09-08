import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
  userId: string; // Reference to user
  templateId: string; // Reference to which admin template is used
  name: string;
  email: string;
  phone: string;
  profile?: string;
  linkedin?: string;
  github?: string;
  education: { school: string; degree: string; year: string }[];
  experience: { company: string; role: string; duration: string }[];
  skills: string[];
  projects: { title: string; description: string; link?: string }[];
  certifications?: string[];
  languages?: string[];
  hobbies?: string[];
}

const ResumeSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    templateId: { type: String, required: true }, // links to Template model

    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    profile: String,
    linkedin: String,
    github: String,

    education: [
      { school: String, degree: String, year: String }
    ],
    experience: [
      { company: String, role: String, duration: String }
    ],
    skills: [String],
    projects: [
      { title: String, description: String, link: String }
    ],

    certifications: [String],
    languages: [String],
    hobbies: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema);
