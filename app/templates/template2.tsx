"use client";
import { useResume } from "@/context/Resumecontext";

export default function Template2() {
  const { data } = useResume();

  return (
    <div className="resume-template template2">
      <header>
        <h1>{data.name || "Your Name"}</h1>
        <p>
          Email: {data.email || "your@email.com"} | Phone:{" "}
          {data.phone || "+91 9876543210"} | LinkedIn:{" "}
          {data.linkedin || "linkedin.com/in/yourprofile"}
        </p>
      </header>

      <section>
        <h2><b>Profile Summary</b></h2>
        <p>{data.profile || "Write your profile summary here..."}</p>
      </section>

      <div className="two-column">
        <section>
          <h2><b>Education</b></h2>
          {data.education.length > 0 ? (
            data.education.map((edu, idx) => (
              <p key={idx}>
                {edu.degree} - {edu.school} ({edu.year})
              </p>
            ))
          ) : (
            <p>MCA - CHARUSAT University (2023–2025)</p>
          )}
        </section>

        <section>
          <h2><b>Skills</b></h2>
          <p>{data.skills?.join(", ") || "React, NodeJS, MongoDB"}</p>
        </section>
      </div>

      <section>
        <h2><b>Experience</b></h2>
        {data.experience.length > 0 ? (
          data.experience.map((exp, idx) => (
            <p key={idx}>
              {exp.role} - {exp.company} ({exp.duration})
            </p>
          ))
        ) : (
          <p>Intern - Teachnook (2 months)</p>
        )}
      </section>

      <section>
        <h2><b>Projects</b></h2>
        {data.projects.length > 0 ? (
          data.projects.map((proj, idx) => (
            <p key={idx}>
              {proj.title} - {proj.description}
            </p>
          ))
        ) : (
          <p>Portfolio Website - Built with Next.js and Tailwind</p>
        )}
      </section>

      <section>
        <h2><b>Certifications</b></h2>
        <p>{data.certifications?.join(", ") || "AWS, ReactJS"}</p>
      </section>

      <section>
        <h2><b>Languages</b></h2>
        <p>{data.languages?.join(", ") || "English, Hindi"}</p>
      </section>

      <section>
        <h2><b>Hobbies</b></h2>
        <p>{data.hobbies?.join(", ") || "Cricket, Photography"}</p>
      </section>

      <style jsx>{`
        .template2 {
          font-family: 'Segoe UI', sans-serif;
          background: #f0f8ff;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          color: black; /* ✅ All text black */
        }
        header {
          background: #0066cc;
          color: #fff;
          padding: 10px;
          border-radius: 10px;
          text-align: center;
        }
        h2 {
          color: black; /* ✅ Headings black */
          margin-top: 20px;
        }
        .two-column {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }
        .two-column section {
          width: 48%;
        }
      `}</style>
    </div>
  );
}
