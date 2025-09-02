"use client";
import { useResume } from "@/context/Resumecontext";

export default function Template1() {
  const { data } = useResume();

  return (
    <div className="font-sans text-gray-800 border-2 border-green-600 p-6 rounded-xl bg-green-50">
      {/* Header */}
      <header className="text-center border-b-2 border-green-600 pb-4 mb-4">
        <h1 className="text-3xl font-bold text-green-700">{data.name}</h1>
        <p>Email: {data.email} | Phone: {data.phone}</p>
        <p>
          <a href={data.github} className="text-blue-600">GitHub</a> |{" "}
          <a href={data.linkedin} className="text-blue-600">LinkedIn</a>
        </p>
      </header>

      {/* Profile / Summary */}
      {data.profile && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">Profile</h2>
          <p>{data.profile}</p>
        </section>
      )}

      {/* Education */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold text-green-700 border-b mb-2">Education</h2>
        {data.education.map((edu, idx) => (
          <p key={idx}>
            <strong>{edu.degree}</strong> - {edu.school} ({edu.year})
          </p>
        ))}
      </section>

      {/* Experience */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold text-green-700 border-b mb-2">Experience</h2>
        {data.experience.map((exp, idx) => (
          <p key={idx}>
            {exp.role} - {exp.company} ({exp.duration})
          </p>
        ))}
      </section>

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">Projects</h2>
          {data.projects.map((proj, idx) => (
            <p key={idx}><strong>{proj.title}</strong>: {proj.description}</p>
          ))}
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">Certifications</h2>
          <ul className="list-disc ml-6">
            {data.certifications.map((cert, idx) => <li key={idx}>{cert}</li>)}
          </ul>
        </section>
      )}

      {/* Skills */}
      <section className="mb-4">
        <h2 className="text-xl font-semibold text-green-700 border-b mb-2">Skills</h2>
        <ul className="list-disc ml-6">
          {data.skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
        </ul>
      </section>

      {/* Languages */}
      {data.languages && (
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">Languages</h2>
          <p>{data.languages.join(", ")}</p>
        </section>
      )}

      {/* Hobbies */}
      {data.hobbies && (
        <section>
          <h2 className="text-xl font-semibold text-green-700 border-b mb-2">Hobbies</h2>
          <p>{data.hobbies.join(", ")}</p>
        </section>
      )}
    </div>
  );
}
