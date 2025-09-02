"use client";
import { useResume } from "@/context/Resumecontext";

export default function Template3() {
  const { data } = useResume();

  return (
    <div className="resume-template template3">
      <header>
        <h1>{data.name || "Your Name"}</h1>
        <p>
          Email: {data.email || "your@email.com"} | GitHub:{" "}
          {data.github || "github.com/yourprofile"}
        </p>
      </header>

      <section>
        <h2>Profile</h2>
        <p>
          {data.profile ||
            "Creative student passionate about web design, MERN stack, and video editing."}
        </p>
      </section>

      <section>
        <h2>Education</h2>
        {data.education && data.education.length > 0 ? (
          data.education.map((edu, idx) => (
            <p key={idx}>
              {edu.degree} - {edu.school} ({edu.year})
            </p>
          ))
        ) : (
          <>
            <p>MCA - University (2023–2025)</p>
            <p>BCA - University (2020–2023)</p>
          </>
        )}
      </section>

      <section>
        <h2>Skills</h2>
        <p>{data.skills?.join(", ") || "React, Django, NodeJS"}</p>
      </section>

      <section>
        <h2>Experience</h2>
        {data.experience && data.experience.length > 0 ? (
          data.experience.map((exp, idx) => (
            <p key={idx}>
              {exp.role} - {exp.company} ({exp.duration})
            </p>
          ))
        ) : (
          <p>Intern - Company (2 months)</p>
        )}
      </section>

      <style jsx>{`
        .template3 {
          font-family: 'Helvetica Neue', sans-serif;
          background: #fff;
          padding: 30px;
          border-left: 6px solid #000;
        }
        header {
          text-align: left;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 28px;
          margin: 0;
        }
        h2 {
          font-size: 18px;
          margin-top: 15px;
          border-bottom: 1px solid #000;
        }
      `}</style>
    </div>
  );
}
