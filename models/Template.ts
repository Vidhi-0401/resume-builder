// import mongoose, { Schema, models } from "mongoose";

// const StyleSchema = new Schema({
//   layoutType: { type: String, default: "single-column" }, // e.g. "modern", "two-column"
//   colorScheme: { type: String, default: "light" }, // "light" | "dark" | "custom"
//   accentColor: { type: String, default: "#4F46E5" }, // primary color
//   fontFamily: { type: String, default: "Inter" },
//   borderStyle: { type: String, default: "none" },
// }, { _id: false });

// const SectionSchema = new Schema({
//   id: { type: String, required: true },
//   label: { type: String, required: true },
// }, { _id: false });

// const LayoutSchema = new Schema({
//   sections: { type: [SectionSchema], default: [] },
//   style: { type: StyleSchema, default: () => ({}) },
// }, { _id: false });

// const TemplateSchema = new Schema({
//   name: { type: String, required: true },
//   category: { type: String, default: "general" }, // e.g., modern, classic, minimal
//   previewUrl: { type: String, default: "" }, // optional preview image
//   layout: { type: LayoutSchema, required: true }, // layout + style together
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   isSystemTemplate: { type: Boolean, default: false }, // admin-created
// }, { timestamps: true });

// const Template = models.Template || mongoose.model("Template", TemplateSchema);
// export default Template;
import mongoose, { Schema, models } from "mongoose";

// Define the style sub-schema
const StyleSchema = new Schema({
  layoutType: { type: String, default: "single-column" }, // e.g. "modern", "two-column"
  colorScheme: { type: String, default: "light" },        // "light" | "dark" | "custom"
  accentColor: { type: String, default: "#4F46E5" },      // primary color
  fontFamily: { type: String, default: "Arial" },         // font name
});

// Define the template schema
const TemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    sections: { type: Array, default: [] },
    style: { type: StyleSchema, default: () => ({}) }, // ✅ must be object
  },
  { timestamps: true }
);

// Export the model
const Template = models.Template || mongoose.model("Template", TemplateSchema);
export default Template;

