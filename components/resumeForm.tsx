"use client";
import { useResume } from "@/context/Resumecontext";
import { useState, useEffect } from "react";

interface ResumeFormProps {
  templateId: string;
  resumeId?: string;
}

export default function ResumeForm({ templateId, resumeId }: ResumeFormProps) {
  const { data, setData } = useResume();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeId) {
      fetch(`/api/resume/${resumeId}`)
        .then((res) => res.json())
        .then((resume) => setData(resume))
        .catch((err) => console.error("❌ Error loading resume:", err));
    }
  }, [resumeId, setData]);

  const handleSave = async () => {
    setLoading(true);
    const method = resumeId ? "PUT" : "POST";
    const url = resumeId ? `/api/resume/${resumeId}` : "/api/resume";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, templateId }),
      });

      if (!res.ok) throw new Error("Failed to save resume");

      alert(resumeId ? "✅ Resume updated" : "✅ Resume saved");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save resume");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setData({ ...data, [key]: value });
  };

  const inputStyle =
    "w-full p-2 border rounded text-gray-900 placeholder-gray-700";

  const fonts = [
    "Arial",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Tahoma",
    "Courier New",
    "Trebuchet MS",
  ];

  return (
    <div className="p-4 border rounded-lg bg-white shadow space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        {resumeId ? "Edit Resume" : "Create Resume"}
      </h2>

      {/* 🎨 Theme & Fonts */}
      <h3 className="font-semibold text-gray-900">Theme Styles</h3>
      <div className="space-y-3">
        {/* Header Color + Font */}
        <div className="flex items-center gap-4">
          <label className="text-gray-800 w-20">Header:</label>
          <input
            type="color"
            value={data.colors?.header || "#000000"}
            onChange={(e) =>
              setData({
                ...data,
                colors: { ...data.colors, header: e.target.value },
              })
            }
            className="w-12 h-10 cursor-pointer"
          />
          <select
            value={data.fonts?.header || "Arial"}
            onChange={(e) =>
              setData({ ...data, fonts: { ...data.fonts, header: e.target.value } })
            }
            className="border p-2 rounded text-gray-900"
          >
            {fonts.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Text Color + Font */}
        <div className="flex items-center gap-4">
          <label className="text-gray-800 w-20">Text:</label>
          <input
            type="color"
            value={data.colors?.text || "#333333"}
            onChange={(e) =>
              setData({
                ...data,
                colors: { ...data.colors, text: e.target.value },
              })
            }
            className="w-12 h-10 cursor-pointer"
          />
          <select
            value={data.fonts?.text || "Arial"}
            onChange={(e) =>
              setData({ ...data, fonts: { ...data.fonts, text: e.target.value } })
            }
            className="border p-2 rounded text-gray-900"
          >
            {fonts.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Background */}
        <div className="flex items-center gap-4">
          <label className="text-gray-800 w-20">Background:</label>
          <input
            type="color"
            value={data.colors?.background || "#ffffff"}
            onChange={(e) =>
              setData({
                ...data,
                colors: { ...data.colors, background: e.target.value },
              })
            }
            className="w-12 h-10 cursor-pointer"
          />
        </div>
      </div>

      {/* ✅ Profile Section */}
      <h3 className="font-semibold text-gray-900">Profile</h3>
      <textarea
        placeholder="Write a short summary about yourself..."
        value={data.profile || ""}
        onChange={(e) => updateField("profile", e.target.value)}
        className={inputStyle}
      />

      {/* Basic Info */}
      <input
        type="text"
        placeholder="Full Name"
        value={data.name || ""}
        onChange={(e) => updateField("name", e.target.value)}
        className={inputStyle}
      />

      <input
        type="email"
        placeholder="Email"
        value={data.email || ""}
        onChange={(e) => updateField("email", e.target.value)}
        className={inputStyle}
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={data.phone || ""}
        onChange={(e) => updateField("phone", e.target.value)}
        className={inputStyle}
      />

      {/* Skills */}
      <h3 className="font-semibold text-gray-900">Skills</h3>
      <input
        type="text"
        placeholder="Comma separated"
        value={data.skills?.join(", ") || ""}
        onChange={(e) =>
          updateField(
            "skills",
            e.target.value.split(",").map((s) => s.trim())
          )
        }
        className={inputStyle}
      />

      {/* Education */}
      <h3 className="font-semibold text-gray-900">Education</h3>
      {data.education?.map((edu, idx) => (
        <div key={idx} className="space-y-2 border p-2 rounded">
          <input
            type="text"
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => {
              const updated = [...data.education];
              updated[idx].degree = e.target.value;
              updateField("education", updated);
            }}
            className={inputStyle}
          />
          <input
            type="text"
            placeholder="School"
            value={edu.school}
            onChange={(e) => {
              const updated = [...data.education];
              updated[idx].school = e.target.value;
              updateField("education", updated);
            }}
            className={inputStyle}
          />
          <input
            type="text"
            placeholder="Year"
            value={edu.year}
            onChange={(e) => {
              const updated = [...data.education];
              updated[idx].year = e.target.value;
              updateField("education", updated);
            }}
            className={inputStyle}
          />
        </div>
      ))}

      {/* Experience */}
      <h3 className="font-semibold text-gray-900">Experience</h3>
      {data.experience?.map((exp, idx) => (
        <div key={idx} className="space-y-2 border p-2 rounded">
          <input
            type="text"
            placeholder="Role"
            value={exp.role}
            onChange={(e) => {
              const updated = [...data.experience];
              updated[idx].role = e.target.value;
              updateField("experience", updated);
            }}
            className={inputStyle}
          />
          <input
            type="text"
            placeholder="Company"
            value={exp.company}
            onChange={(e) => {
              const updated = [...data.experience];
              updated[idx].company = e.target.value;
              updateField("experience", updated);
            }}
            className={inputStyle}
          />
          <input
            type="text"
            placeholder="Duration"
            value={exp.duration}
            onChange={(e) => {
              const updated = [...data.experience];
              updated[idx].duration = e.target.value;
              updateField("experience", updated);
            }}
            className={inputStyle}
          />
        </div>
      ))}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Saving..." : resumeId ? "Update Resume" : "Save Resume"}
      </button>
    </div>
  );
}
