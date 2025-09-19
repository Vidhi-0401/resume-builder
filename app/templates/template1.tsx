"use client";
import { useResume } from "@/context/Resumecontext";

export default function Template1() {
  const { data } = useResume();

  return (
    <div className="font-sans text-gray-800 border-2 border-green-600 p-6 rounded-xl bg-green-50">
      {/* Header */}
      <header className="text-center border-b-2 border-green-600 pb-4 mb-4">
        <h1 className="text-3xl font-bold text-green-700">
          {data?.name || "Your Name"}
        </h1>
        <p>
          {data?.email || "youremail@example.com"} |{" "}
          {data?.phone || "123-456-7890"}
        </p>
        {(data?.github || data?.linkedin) && (
          <p>
            {data.github && (
              <a
                href={data.github}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            )}
            {data.github && data.linkedin && " | "}
            {data.linkedin && (
              <a
                href={data.linkedin}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            )}
          </p>
        )}
      </header>

      {/* Profile / Summary */}
      {data?.profile && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">
            Profile
          </h2>
          <p>{data.profile}</p>
        </section>
      )}

      {/* Education */}
      {data?.education?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">
            Education
          </h2>
          {data.education.map((edu: any, idx: number) => (
            <p key={idx}>
              <strong>{edu.degree || "Degree"}</strong> –{" "}
              {edu.school || "School"} ({edu.year || "Year"})
            </p>
          ))}
        </section>
      )}

      {/* Experience */}
      {data?.experience?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">
            Experience
          </h2>
          {data.experience.map((exp: any, idx: number) => (
            <p key={idx}>
              {exp.role || "Role"} – {exp.company || "Company"} (
              {exp.duration || "Duration"})
            </p>
          ))}
        </section>
      )}

      {/* Projects */}
      {data?.projects?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">
            Projects
          </h2>
          {data.projects.map((proj: any, idx: number) => (
            <p key={idx}>
              <strong>{proj.title || "Project Title"}</strong>:{" "}
              {proj.description || "Project description..."}
            </p>
          ))}
        </section>
      )}

      {/* Certifications */}
      {data?.certifications?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">
            Certifications
          </h2>
          <ul className="list-disc ml-6">
            {data.certifications.map((cert: string, idx: number) => (
              <li key={idx}>{cert || "Certification"}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Skills */}
      {data?.skills?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">
            Skills
          </h2>
          <ul className="list-disc ml-6">
            {data.skills.map((skill: string, idx: number) => (
              <li key={idx}>{skill || "Skill"}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Languages */}
      {data?.languages?.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">
            Languages
          </h2>
          <p>{data.languages.join(", ")}</p>
        </section>
      )}

      {/* Hobbies */}
      {data?.hobbies?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">
            Hobbies
          </h2>
          <p>{data.hobbies.join(", ")}</p>
        </section>
      )}
    </div>
  );
}

