import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  education: { school: string; degree: string; year: string }[];
  experience: { company: string; role: string; duration: string }[];
  skills: string[];
  projects: { title: string; description: string; link: string }[];
}

const ResumeSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    name: String,
    email: String,
    phone: String,
    education: [{ school: String, degree: String, year: String }],
    experience: [{ company: String, role: String, duration: String }],
    skills: [String],
    projects: [{ title: String, description: String, link: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);
