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

  // ✅ Load resume when editing
  useEffect(() => {
    if (resumeId) {
      fetch(`/api/resume/${resumeId}`)
        .then((res) => res.json())
        .then((resume) => setData(resume))
        .catch((err) => console.error("❌ Error loading resume:", err));
    }
  }, [resumeId, setData]);

  // ✅ Save or update resume
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

      if (!res.ok) {
        throw new Error("Failed to save resume");
      }

      alert(resumeId ? "✅ Resume updated" : "✅ Resume saved");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow space-y-4">
      <h2 className="text-xl font-bold">
        {resumeId ? "Edit Resume" : "Create Resume"}
      </h2>

      {/* Common fields */}
      <input
        type="text"
        placeholder="Full Name"
        value={data.name || ""}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={data.email || ""}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={data.phone || ""}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        className="w-full p-2 border rounded"
      />

      {/* Template-specific fields */}
      {templateId === "template1" && (
        <>
          <textarea
            placeholder="Profile"
            value={data.profile || ""}
            onChange={(e) => setData({ ...data, profile: e.target.value })}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="GitHub Profile"
            value={data.github || ""}
            onChange={(e) => setData({ ...data, github: e.target.value })}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="LinkedIn Profile"
            value={data.linkedin || ""}
            onChange={(e) => setData({ ...data, linkedin: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </>
      )}

      {templateId === "template2" && (
        <>
          <textarea
            placeholder="Profile Summary"
            value={data.profile || ""}
            onChange={(e) => setData({ ...data, profile: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </>
      )}

      {templateId === "template3" && (
        <>
          <textarea
            placeholder="Profile"
            value={data.profile || ""}
            onChange={(e) => setData({ ...data, profile: e.target.value })}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="GitHub Profile"
            value={data.github || ""}
            onChange={(e) => setData({ ...data, github: e.target.value })}
            className="w-full p-2 border rounded"
          />

          {/* Education */}
          <h3 className="font-semibold">Education</h3>
          {data.education?.map((edu, idx) => (
            <div key={idx} className="space-y-2 border p-2 rounded">
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[idx].degree = e.target.value;
                  setData({ ...data, education: updated });
                }}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="School"
                value={edu.school}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[idx].school = e.target.value;
                  setData({ ...data, education: updated });
                }}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Year"
                value={edu.year}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[idx].year = e.target.value;
                  setData({ ...data, education: updated });
                }}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}

          {/* Experience */}
          <h3 className="font-semibold">Experience</h3>
          {data.experience?.map((exp, idx) => (
            <div key={idx} className="space-y-2 border p-2 rounded">
              <input
                type="text"
                placeholder="Role"
                value={exp.role}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[idx].role = e.target.value;
                  setData({ ...data, experience: updated });
                }}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Company"
                value={exp.company}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[idx].company = e.target.value;
                  setData({ ...data, experience: updated });
                }}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Duration"
                value={exp.duration}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[idx].duration = e.target.value;
                  setData({ ...data, experience: updated });
                }}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
        </>
      )}

      {/* Shared Sections (Projects, Certifications, Languages, Hobbies, Skills) */}
      <h3 className="font-semibold">Projects</h3>
      {data.projects?.map((proj, idx) => (
        <div key={idx} className="space-y-2 border p-2 rounded">
          <input
            type="text"
            placeholder="Project Title"
            value={proj.title}
            onChange={(e) => {
              const updated = [...data.projects];
              updated[idx].title = e.target.value;
              setData({ ...data, projects: updated });
            }}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Project Description"
            value={proj.description}
            onChange={(e) => {
              const updated = [...data.projects];
              updated[idx].description = e.target.value;
              setData({ ...data, projects: updated });
            }}
            className="w-full p-2 border rounded"
          />
        </div>
      ))}

      <h3 className="font-semibold">Certifications</h3>
      <input
        type="text"
        placeholder="Comma separated"
        value={data.certifications?.join(", ") || ""}
        onChange={(e) =>
          setData({
            ...data,
            certifications: e.target.value.split(",").map((s) => s.trim()),
          })
        }
        className="w-full p-2 border rounded"
      />

      <h3 className="font-semibold">Languages</h3>
      <input
        type="text"
        placeholder="Comma separated"
        value={data.languages?.join(", ") || ""}
        onChange={(e) =>
          setData({
            ...data,
            languages: e.target.value.split(",").map((s) => s.trim()),
          })
        }
        className="w-full p-2 border rounded"
      />

      <h3 className="font-semibold">Hobbies</h3>
      <input
        type="text"
        placeholder="Comma separated"
        value={data.hobbies?.join(", ") || ""}
        onChange={(e) =>
          setData({
            ...data,
            hobbies: e.target.value.split(",").map((s) => s.trim()),
          })
        }
        className="w-full p-2 border rounded"
      />

      <h3 className="font-semibold">Skills</h3>
      <input
        type="text"
        placeholder="Comma separated"
        value={data.skills?.join(", ") || ""}
        onChange={(e) =>
          setData({
            ...data,
            skills: e.target.value.split(",").map((s) => s.trim()),
          })
        }
        className="w-full p-2 border rounded"
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading
          ? "Saving..."
          : resumeId
          ? "Update Resume"
          : "Save Resume"}
      </button>
    </div>
  );
}
