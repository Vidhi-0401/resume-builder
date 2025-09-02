"use client";
import { useResume } from "@/context/Resumecontext";

export default function ResumeForm({ templateId }: { templateId: string }) {
  const { data, setData } = useResume();

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold">Edit Resume</h2>

      {/* Common fields */}
      <input
        type="text"
        className="w-full border p-2 rounded"
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        placeholder="Full Name"
      />

      <input
        type="email"
        className="w-full border p-2 rounded"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        placeholder="Email"
      />

      <input
        type="text"
        className="w-full border p-2 rounded"
        value={data.phone}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        placeholder="Phone"
      />

      {templateId === "template1" && (
  <>
    <h3 className="font-semibold">Profile</h3>
    <textarea
      className="w-full border p-2 rounded"
      value={data.profile}
      onChange={(e) => setData({ ...data, profile: e.target.value })}
      placeholder="Short profile / summary"
    />

    <h3 className="font-semibold">GitHub</h3>
    <input
      type="text"
      className="w-full border p-2 rounded"
      value={data.github}
      onChange={(e) => setData({ ...data, github: e.target.value })}
      placeholder="GitHub profile link"
    />

    <h3 className="font-semibold">LinkedIn</h3>
    <input
      type="text"
      className="w-full border p-2 rounded"
      value={data.linkedin}
      onChange={(e) => setData({ ...data, linkedin: e.target.value })}
      placeholder="LinkedIn profile link"
    />

    {/* Projects */}
    <h3 className="font-semibold">Projects</h3>
    {data.projects.map((proj, idx) => (
      <div key={idx} className="space-y-2 border p-2 rounded">
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={proj.title}
          onChange={(e) => {
            const updated = [...data.projects];
            updated[idx].title = e.target.value;
            setData({ ...data, projects: updated });
          }}
          placeholder="Project Title"
        />
        <textarea
          className="w-full border p-2 rounded"
          value={proj.description}
          onChange={(e) => {
            const updated = [...data.projects];
            updated[idx].description = e.target.value;
            setData({ ...data, projects: updated });
          }}
          placeholder="Project Description"
        />
      </div>
    ))}

    {/* Certifications */}
    <h3 className="font-semibold">Certifications (comma separated)</h3>
    <input
      type="text"
      className="w-full border p-2 rounded"
      value={data.certifications.join(", ")}
      onChange={(e) =>
        setData({ ...data, certifications: e.target.value.split(",").map((s) => s.trim()) })
      }
    />

    {/* Languages */}
    <h3 className="font-semibold">Languages (comma separated)</h3>
    <input
      type="text"
      className="w-full border p-2 rounded"
      value={data.languages.join(", ")}
      onChange={(e) =>
        setData({ ...data, languages: e.target.value.split(",").map((s) => s.trim()) })
      }
    />

    {/* Hobbies */}
    <h3 className="font-semibold">Hobbies (comma separated)</h3>
    <input
      type="text"
      className="w-full border p-2 rounded"
      value={data.hobbies.join(", ")}
      onChange={(e) =>
        setData({ ...data, hobbies: e.target.value.split(",").map((s) => s.trim()) })
      }
    />
  </>
)}


      {/* Extra fields only for Template2 */}
      {templateId === "template2" && (
  <>
    <h3 className="font-semibold">Profile Summary</h3>
    <textarea
      className="w-full border p-2 rounded"
      value={data.profile}
      onChange={(e) => setData({ ...data, profile: e.target.value })}
      placeholder="Write your profile summary"
    />

    <h3 className="font-semibold">Projects</h3>
    {data.projects.map((proj, idx) => (
      <div key={idx} className="space-y-2 border p-2 rounded">
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={proj.title}
          onChange={(e) => {
            const updated = [...data.projects];
            updated[idx].title = e.target.value;
            setData({ ...data, projects: updated });
          }}
          placeholder="Project Title"
        />
        <textarea
          className="w-full border p-2 rounded"
          value={proj.description}
          onChange={(e) => {
            const updated = [...data.projects];
            updated[idx].description = e.target.value;
            setData({ ...data, projects: updated });
          }}
          placeholder="Project Description"
        />
      </div>
    ))}

    <h3 className="font-semibold">Certifications (comma separated)</h3>
    <input
      type="text"
      className="w-full border p-2 rounded"
      value={data.certifications.join(", ")}
      onChange={(e) =>
        setData({
          ...data,
          certifications: e.target.value.split(",").map((s) => s.trim()),
        })
      }
    />

    <h3 className="font-semibold">Languages (comma separated)</h3>
    <input
      type="text"
      className="w-full border p-2 rounded"
      value={data.languages.join(", ")}
      onChange={(e) =>
        setData({
          ...data,
          languages: e.target.value.split(",").map((s) => s.trim()),
        })
      }
    />

    <h3 className="font-semibold">Hobbies (comma separated)</h3>
    <input
      type="text"
      className="w-full border p-2 rounded"
      value={data.hobbies.join(", ")}
      onChange={(e) =>
        setData({
          ...data,
          hobbies: e.target.value.split(",").map((s) => s.trim()),
        })
      }
    />
  </>
)}

      {/* Extra fields only for Template3 */}
      {templateId === "template3" && (
        <>
          <h3 className="font-semibold">Profile</h3>
          <textarea
            className="w-full border p-2 rounded"
            value={data.profile}
            onChange={(e) => setData({ ...data, profile: e.target.value })}
            placeholder="Short profile / summary"
          />

          <h3 className="font-semibold">GitHub</h3>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={data.github}
            onChange={(e) => setData({ ...data, github: e.target.value })}
            placeholder="GitHub profile link"
          />

          <h3 className="font-semibold">Education</h3>
          {data.education.map((edu, idx) => (
            <div key={idx} className="space-y-2 border p-2 rounded">
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={edu.degree}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[idx].degree = e.target.value;
                  setData({ ...data, education: updated });
                }}
                placeholder="Degree"
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={edu.school}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[idx].school = e.target.value;
                  setData({ ...data, education: updated });
                }}
                placeholder="School"
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={edu.year}
                onChange={(e) => {
                  const updated = [...data.education];
                  updated[idx].year = e.target.value;
                  setData({ ...data, education: updated });
                }}
                placeholder="Year"
              />
            </div>
          ))}

          <h3 className="font-semibold">Experience</h3>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="space-y-2 border p-2 rounded">
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={exp.role}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[idx].role = e.target.value;
                  setData({ ...data, experience: updated });
                }}
                placeholder="Role"
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={exp.company}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[idx].company = e.target.value;
                  setData({ ...data, experience: updated });
                }}
                placeholder="Company"
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={exp.duration}
                onChange={(e) => {
                  const updated = [...data.experience];
                  updated[idx].duration = e.target.value;
                  setData({ ...data, experience: updated });
                }}
                placeholder="Duration"
              />
            </div>
          ))}
        </>
      )}

      {/* Skills (for all templates) */}
      <h3 className="font-semibold">Skills (comma separated)</h3>
      <input
        type="text"
        className="w-full border p-2 rounded"
        value={data.skills.join(", ")}
        onChange={(e) =>
          setData({
            ...data,
            skills: e.target.value.split(",").map((s) => s.trim()),
          })
        }
      />
    </div>

    
  );
}
