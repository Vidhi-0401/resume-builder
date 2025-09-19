"use client";
import { useResume } from "@/context/Resumecontext";

export default function TemplateRenderer({ template }: { template: any }) {
  const { data, setData } = useResume();

  // ✅ Provide safe defaults to avoid runtime errors
  const colors = data?.colors || {
    background: "white",
    text: "black",
    header: "black",
  };
  const fonts = data?.fonts || {
    text: "Arial, sans-serif",
    header: "Arial, sans-serif",
  };

  return (
    <div
      className="p-6 border rounded-lg shadow-md"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: fonts.text,
      }}
    >
      {template.layout?.sections?.map((section: any, idx: number) => (
        <div key={idx} className="mb-6">
          {section.id === "profile" && (
            <div>
              <h1
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  setData({ ...data, name: e.currentTarget.textContent || "" })
                }
                className="text-3xl font-bold mb-2"
                style={{
                  color: colors.header,
                  fontFamily: fonts.header,
                }}
              >
                {data?.name || "Your Name"}
              </h1>
              <p style={{ fontFamily: fonts.text }}>
                {data?.email || "youremail@example.com"} |{" "}
                {data?.phone || "123-456-7890"}
              </p>

              {/* ✅ Profile Summary */}
              <div>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{
                    color: colors.header,
                    fontFamily: fonts.header,
                  }}
                >
                  Profile
                </h2>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    setData({
                      ...data,
                      profile: e.currentTarget.textContent || "",
                    })
                  }
                  className="mt-2 italic"
                  style={{ fontFamily: fonts.text }}
                >
                  {data?.profile || "Write a short summary here..."}
                </p>
              </div>
            </div>
          )}

          {/* Skills */}
          {section.id === "skills" && (
            <div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{
                  color: colors.header,
                  fontFamily: fonts.header,
                }}
              >
                Skills
              </h2>
              <ul className="list-disc ml-5" style={{ fontFamily: fonts.text }}>
                {data?.skills?.map((skill, i) => (
                  <li
                    key={i}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updated = [...data.skills];
                      updated[i] = e.currentTarget.textContent || "";
                      setData({ ...data, skills: updated });
                    }}
                  >
                    {skill}
                  </li>
                )) || <li>Add your skills here...</li>}
              </ul>
            </div>
          )}

          {/* Education */}
          {section.id === "education" && (
            <div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{
                  color: colors.header,
                  fontFamily: fonts.header,
                }}
              >
                Education
              </h2>
              {data?.education?.map((edu, i) => (
                <p
                  key={i}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updated = [...data.education];
                    updated[i].degree = e.currentTarget.textContent || "";
                    setData({ ...data, education: updated });
                  }}
                  style={{ fontFamily: fonts.text }}
                >
                  {edu.degree}, {edu.school} ({edu.year})
                </p>
              )) || <p>Add your education details...</p>}
            </div>
          )}

          {/* Experience */}
          {section.id === "experience" && (
            <div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{
                  color: colors.header,
                  fontFamily: fonts.header,
                }}
              >
                Experience
              </h2>
              {data?.experience?.map((exp, i) => (
                <p
                  key={i}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updated = [...data.experience];
                    updated[i].role = e.currentTarget.textContent || "";
                    setData({ ...data, experience: updated });
                  }}
                  style={{ fontFamily: fonts.text }}
                >
                  {exp.role} @ {exp.company} ({exp.duration})
                </p>
              )) || <p>Add your work experience...</p>}
            </div>
          )}

          {/* Projects */}
          {section.id === "projects" && (
            <div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{
                  color: colors.header,
                  fontFamily: fonts.header,
                }}
              >
                Projects
              </h2>
              {data?.projects?.map((proj, i) => (
                <p
                  key={i}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updated = [...data.projects];
                    updated[i].title = e.currentTarget.textContent || "";
                    setData({ ...data, projects: updated });
                  }}
                  style={{ fontFamily: fonts.text }}
                >
                  {proj.title} – {proj.description}
                </p>
              )) || <p>Add your projects...</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
