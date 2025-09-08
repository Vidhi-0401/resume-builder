// models/Template.ts
import mongoose, { Schema, models } from "mongoose";

const TemplateSchema = new Schema({
  name: { type: String, required: true },
  layout: { type: Object, required: true }, // JSON config for builder
  previewUrl: { type: String, default: "" }, // optional preview image URL
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Template = models.Template || mongoose.model("Template", TemplateSchema);
export default Template;
