// import mongoose, { Schema, Document } from "mongoose";

// export interface IResume extends Document {
//   userId: string;
//   templateId: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   profile?: string;
//   linkedin?: string;
//   github?: string;
//   education?: { school: string; degree: string; year: string }[];
//   experience?: { company: string; role: string; duration: string }[];
//   skills?: string[];
//   projects?: { title: string; description: string; link?: string }[];
//   certifications?: string[];
//   languages?: string[];
//   hobbies?: string[];
//   pages?: any[]; // ✅ Added for blank editor page data
// }

// const ResumeSchema: Schema = new Schema(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },
//     name: { type: String, required: true },

//     // Optional fields for normal resume templates
//     email: String,
//     phone: String,
//     profile: String,
//     linkedin: String,
//     github: String,

//     education: [{ school: String, degree: String, year: String }],
//     experience: [{ company: String, role: String, duration: String }],
//     skills: [String],
//     projects: [{ title: String, description: String, link: String }],
//     certifications: [String],
//     languages: [String],
//     hobbies: [String],

//     // ✅ For Blank Editor (Canvas)
//     pages: { type: Array, default: [] },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Resume ||
//   mongoose.model<IResume>("Resume", ResumeSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
  userId: string;
  templateId: string;
  name: string;
  email?: string;
  phone?: string;
  profile?: string;
  linkedin?: string;
  github?: string;
  education?: { school: string; degree: string; year: string }[];
  experience?: { company: string; role: string; duration: string }[];
  skills?: string[];
  projects?: { title: string; description: string; link?: string }[];
  certifications?: string[];
  languages?: string[];
  hobbies?: string[];
  pages?: any[];
}

const ResumeSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    templateId: { type: String, required: true },
    name: { type: String, required: true },

    // ✅ Make these optional
    email: { type: String },
    phone: { type: String },

    profile: String,
    linkedin: String,
    github: String,
    education: [{ school: String, degree: String, year: String }],
    experience: [{ company: String, role: String, duration: String }],
    skills: [String],
    projects: [{ title: String, description: String, link: String }],
    certifications: [String],
    languages: [String],
    hobbies: [String],
    pages: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema);
