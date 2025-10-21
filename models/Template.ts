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
// models/Template.ts
import mongoose, { Schema, models } from "mongoose";

/**
 * Style sub-schema: describes visual config for either the template or the layout.
 */
const StyleSchema = new Schema({
  layoutType: { type: String, default: "single-column" }, // e.g. "single-column", "two-column", "modern"
  colorScheme: { type: String, default: "light" },        // "light" | "dark" | "custom"
  accentColor: { type: String, default: "#4F46E5" },      // primary color hex
  fontFamily: { type: String, default: "Arial" },         // font family name
}, { _id: false });

/**
 * Layout schema: contains ordered sections, style overrides, background, etc.
 */
const LayoutSchema = new Schema({
  sections: {
    type: [
      new Schema({
        id: { type: String, required: true },
        label: { type: String },
        uid: { type: String }, // optional: the builder uses uid in client; we store id+label (uid optional)
        // you can extend this with per-section config later
      }, { _id: false })
    ],
    default: []
  },
  style: { type: StyleSchema, default: () => ({}) },
  background: { type: String, default: "Light" },
}, { _id: false });

/**
 * Template schema: top-level template document.
 */
const TemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    previewUrl: { type: String, default: "" },

    // backward-compatible top-level fields (optional)
    sections: { type: Array, default: [] }, // some older code might use this

    // ✅ NEW: store the UI's layout under `layout`
    layout: { type: LayoutSchema, default: () => ({}) },

    // if you still want a top-level style, keep it
    style: { type: StyleSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Avoid model overwrite in development
const Template = models.Template || mongoose.model("Template", TemplateSchema);
export default Template;
