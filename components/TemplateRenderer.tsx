"use client";
import { useResume } from "@/context/Resumecontext";

export default function TemplateRenderer({ template }: { template: any }) {
  const { data, setData } = useResume();

  return (
    <div className="p-6 border rounded-lg bg-white shadow-md">
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
              >
                {data.name}
              </h1>
              <p className="text-gray-600">{data.email} | {data.phone}</p>
            </div>
          )}

          {section.id === "skills" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Skills</h2>
              <ul className="list-disc ml-5">
                {data.skills.map((skill, i) => (
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
                ))}
              </ul>
            </div>
          )}

          {section.id === "education" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Education</h2>
              {data.education.map((edu, i) => (
                <p
                  key={i}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updated = [...data.education];
                    updated[i].degree = e.currentTarget.textContent || "";
                    setData({ ...data, education: updated });
                  }}
                >
                  {edu.degree}, {edu.school} ({edu.year})
                </p>
              ))}
            </div>
          )}

          {section.id === "experience" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Experience</h2>
              {data.experience.map((exp, i) => (
                <p
                  key={i}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updated = [...data.experience];
                    updated[i].role = e.currentTarget.textContent || "";
                    setData({ ...data, experience: updated });
                  }}
                >
                  {exp.role} @ {exp.company} ({exp.duration})
                </p>
              ))}
            </div>
          )}

          {section.id === "projects" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Projects</h2>
              {data.projects.map((proj, i) => (
                <p
                  key={i}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updated = [...data.projects];
                    updated[i].title = e.currentTarget.textContent || "";
                    setData({ ...data, projects: updated });
                  }}
                >
                  {proj.title} – {proj.description}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
