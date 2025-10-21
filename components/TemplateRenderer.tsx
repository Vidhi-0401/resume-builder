// "use client";
// import { useResume } from "@/context/Resumecontext";

// export default function TemplateRenderer({ template }: { template: any }) {
//   const { data, setData } = useResume();

//   // ✅ Safe defaults
//   const colors = data?.colors || {
//     background: "white",
//     text: "black",
//     header: "black",
//   };
//   const fonts = data?.fonts || {
//     text: "Arial, sans-serif",
//     header: "Arial, sans-serif",
//   };

//   console.log("TemplateRenderer received:", template);
//   console.log("Type of template.layout.style:", typeof template.layout?.style);

//   // ✅ Prevent crash if template is invalid
//   if (!template || typeof template !== "object") {
//     return <div>Invalid template data</div>;
//   }

//   // ✅ Avoid rendering plain objects (layout or style)
//   if (
//     template.layout &&
//     typeof template.layout === "object" &&
//     !Array.isArray(template.layout.sections)
//   ) {
//     // 🔹 Handle case where layout.style is the object with { layoutType, colorScheme, ... }
//     if (template.layout.style && typeof template.layout.style === "object") {
//       return (
//         <div className="p-6 border rounded-lg shadow-md text-gray-600">
//           <h2 className="text-lg font-semibold mb-2">Template Style Preview</h2>
//           <p className="text-sm mb-2">
//             Layout settings detected — rendering style configuration safely:
//           </p>
//           <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
//             {JSON.stringify(template.layout.style, null, 2)}
//           </pre>
//         </div>
//       );
//     }

//     // 🔹 Generic fallback for other layout-only templates
//     return (
//       <div className="p-6 border rounded-lg shadow-md text-gray-600">
//         <h2 className="text-lg font-semibold mb-2">Template Layout Preview</h2>
//         <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
//           {JSON.stringify(template.layout, null, 2)}
//         </pre>
//       </div>
//     );
//   }

//   // ✅ Render structured sections if available
//   return (
//     <div
//       className="p-6 border rounded-lg shadow-md"
//       style={{
//         backgroundColor: colors.background,
//         color: colors.text,
//         fontFamily: fonts.text,
//       }}
//     >
//       {Array.isArray(template.layout?.sections) &&
//         template.layout.sections.map((section: any, idx: number) => (
//           <div key={idx} className="mb-6">
//             {section.id === "profile" && (
//               <div>
//                 <h1
//                   contentEditable
//                   suppressContentEditableWarning
//                   onBlur={(e) =>
//                     setData({ ...data, name: e.currentTarget.textContent || "" })
//                   }
//                   className="text-3xl font-bold mb-2"
//                   style={{
//                     color: colors.header,
//                     fontFamily: fonts.header,
//                   }}
//                 >
//                   {data?.name || "Your Name"}
//                 </h1>
//                 <p style={{ fontFamily: fonts.text }}>
//                   {data?.email || "youremail@example.com"} |{" "}
//                   {data?.phone || "123-456-7890"}
//                 </p>

//                 <div>
//                   <h2
//                     className="text-xl font-semibold mb-2"
//                     style={{
//                       color: colors.header,
//                       fontFamily: fonts.header,
//                     }}
//                   >
//                     Profile
//                   </h2>
//                   <p
//                     contentEditable
//                     suppressContentEditableWarning
//                     onBlur={(e) =>
//                       setData({
//                         ...data,
//                         profile: e.currentTarget.textContent || "",
//                       })
//                     }
//                     className="mt-2 italic"
//                     style={{ fontFamily: fonts.text }}
//                   >
//                     {data?.profile || "Write a short summary here..."}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {section.id === "skills" && (
//               <div>
//                 <h2
//                   className="text-xl font-semibold mb-2"
//                   style={{
//                     color: colors.header,
//                     fontFamily: fonts.header,
//                   }}
//                 >
//                   Skills
//                 </h2>
//                 <ul
//                   className="list-disc ml-5"
//                   style={{ fontFamily: fonts.text }}
//                 >
//                   {data?.skills?.length ? (
//                     data.skills.map((skill, i) => (
//                       <li
//                         key={i}
//                         contentEditable
//                         suppressContentEditableWarning
//                         onBlur={(e) => {
//                           const updated = [...data.skills];
//                           updated[i] = e.currentTarget.textContent || "";
//                           setData({ ...data, skills: updated });
//                         }}
//                       >
//                         {skill}
//                       </li>
//                     ))
//                   ) : (
//                     <li>Add your skills here...</li>
//                   )}
//                 </ul>
//               </div>
//             )}

//             {section.id === "education" && (
//               <div>
//                 <h2
//                   className="text-xl font-semibold mb-2"
//                   style={{
//                     color: colors.header,
//                     fontFamily: fonts.header,
//                   }}
//                 >
//                   Education
//                 </h2>
//                 {data?.education?.length ? (
//                   data.education.map((edu, i) => (
//                     <p
//                       key={i}
//                       contentEditable
//                       suppressContentEditableWarning
//                       onBlur={(e) => {
//                         const updated = [...data.education];
//                         updated[i].degree = e.currentTarget.textContent || "";
//                         setData({ ...data, education: updated });
//                       }}
//                       style={{ fontFamily: fonts.text }}
//                     >
//                       {edu.degree}, {edu.school} ({edu.year})
//                     </p>
//                   ))
//                 ) : (
//                   <p>Add your education details...</p>
//                 )}
//               </div>
//             )}

//             {section.id === "experience" && (
//               <div>
//                 <h2
//                   className="text-xl font-semibold mb-2"
//                   style={{
//                     color: colors.header,
//                     fontFamily: fonts.header,
//                   }}
//                 >
//                   Experience
//                 </h2>
//                 {data?.experience?.length ? (
//                   data.experience.map((exp, i) => (
//                     <p
//                       key={i}
//                       contentEditable
//                       suppressContentEditableWarning
//                       onBlur={(e) => {
//                         const updated = [...data.experience];
//                         updated[i].role = e.currentTarget.textContent || "";
//                         setData({ ...data, experience: updated });
//                       }}
//                       style={{ fontFamily: fonts.text }}
//                     >
//                       {exp.role} @ {exp.company} ({exp.duration})
//                     </p>
//                   ))
//                 ) : (
//                   <p>Add your work experience...</p>
//                 )}
//               </div>
//             )}

//             {section.id === "projects" && (
//               <div>
//                 <h2
//                   className="text-xl font-semibold mb-2"
//                   style={{
//                     color: colors.header,
//                     fontFamily: fonts.header,
//                   }}
//                 >
//                   Projects
//                 </h2>
//                 {data?.projects?.length ? (
//                   data.projects.map((proj, i) => (
//                     <p
//                       key={i}
//                       contentEditable
//                       suppressContentEditableWarning
//                       onBlur={(e) => {
//                         const updated = [...data.projects];
//                         updated[i].title = e.currentTarget.textContent || "";
//                         setData({ ...data, projects: updated });
//                       }}
//                       style={{ fontFamily: fonts.text }}
//                     >
//                       {proj.title} – {proj.description}
//                     </p>
//                   ))
//                 ) : (
//                   <p>Add your projects...</p>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//     </div>
//   );
// }
"use client";
import { useResume } from "@/context/Resumecontext";

export default function TemplateRenderer({ template }: { template: any }) {
  const { data, setData } = useResume();

  const colors = data?.colors || {
    background: "white",
    text: "black",
    header: "black",
  };
  const fonts = data?.fonts || {
    text: "Arial, sans-serif",
    header: "Arial, sans-serif",
  };

  if (!template || typeof template !== "object") {
    return <div>Invalid template data</div>;
  }

  return (
    <div
      className="p-6 border rounded-lg shadow-md"
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: fonts.text,
      }}
    >
      {Array.isArray(template.layout?.sections) &&
        template.layout.sections.map((section: any, idx: number) => (
          <div key={idx} className="mb-6">
            {/* ✅ Profile */}
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

            {/* ✅ Skills */}
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
                  {data?.skills?.length ? (
                    data.skills.map((skill, i) => (
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
                    ))
                  ) : (
                    <li>Add your skills here...</li>
                  )}
                </ul>
              </div>
            )}

            {/* ✅ Education */}
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
                {data?.education?.length ? (
                  data.education.map((edu, i) => (
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
                  ))
                ) : (
                  <p>Add your education details...</p>
                )}
              </div>
            )}

            {/* ✅ Experience */}
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
                {data?.experience?.length ? (
                  data.experience.map((exp, i) => (
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
                  ))
                ) : (
                  <p>Add your work experience...</p>
                )}
              </div>
            )}

            {/* ✅ Projects */}
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
                {data?.projects?.length ? (
                  data.projects.map((proj, i) => (
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
                  ))
                ) : (
                  <p>Add your projects...</p>
                )}
              </div>
            )}

            {/* ✅ Certifications */}
            {section.id === "certifications" && (
              <div>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{
                    color: colors.header,
                    fontFamily: fonts.header,
                  }}
                >
                  Certifications
                </h2>
                <ul className="list-disc ml-5" style={{ fontFamily: fonts.text }}>
                  {data?.certifications?.length ? (
                    data.certifications.map((cert, i) => (
                      <li
                        key={i}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updated = [...data.certifications];
                          updated[i] = e.currentTarget.textContent || "";
                          setData({ ...data, certifications: updated });
                        }}
                      >
                        {cert}
                      </li>
                    ))
                  ) : (
                    <li>Add your certifications...</li>
                  )}
                </ul>
              </div>
            )}

            {/* ✅ Languages */}
            {section.id === "languages" && (
              <div>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{
                    color: colors.header,
                    fontFamily: fonts.header,
                  }}
                >
                  Languages
                </h2>
                <ul className="list-disc ml-5" style={{ fontFamily: fonts.text }}>
                  {data?.languages?.length ? (
                    data.languages.map((lang, i) => (
                      <li
                        key={i}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updated = [...data.languages];
                          updated[i] = e.currentTarget.textContent || "";
                          setData({ ...data, languages: updated });
                        }}
                      >
                        {lang}
                      </li>
                    ))
                  ) : (
                    <li>Add your languages...</li>
                  )}
                </ul>
              </div>
            )}

            {/* ✅ Hobbies */}
            {section.id === "hobbies" && (
              <div>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{
                    color: colors.header,
                    fontFamily: fonts.header,
                  }}
                >
                  Hobbies
                </h2>
                <ul className="list-disc ml-5" style={{ fontFamily: fonts.text }}>
                  {data?.hobbies?.length ? (
                    data.hobbies.map((hobby, i) => (
                      <li
                        key={i}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const updated = [...data.hobbies];
                          updated[i] = e.currentTarget.textContent || "";
                          setData({ ...data, hobbies: updated });
                        }}
                      >
                        {hobby}
                      </li>
                    ))
                  ) : (
                    <li>Add your hobbies...</li>
                  )}
                </ul>
              </div>

            )}
            {/* ✅ Contact Info (moved inside the map) */}
            {section.id === "contact" && (
              <div>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{
                    color: colors.header,
                    fontFamily: fonts.header,
                  }}
                >
                  Contact Info
                </h2>
                <p style={{ fontFamily: fonts.text }}>
                  {data?.email || "youremail@example.com"} |{" "}
                  {data?.phone || "123-456-7890"}
                </p>
                <p style={{ fontFamily: fonts.text }}>
                  {data?.address || "Your City, Country"}
                </p>
              </div>
            )}

            {/* ✅ Links (moved inside the map) */}
            {section.id === "links" && (
              <div>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{
                    color: colors.header,
                    fontFamily: fonts.header,
                  }}
                >
                  Links
                </h2>
                <ul className="list-disc ml-5" style={{ fontFamily: fonts.text }}>
                  {data?.links?.length ? (
                    data.links.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {link.label || link.url}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li>Add your links (e.g., LinkedIn, GitHub)...</li>
                  )}
                </ul>
              </div>
            )}
          </div>

        ))}

    </div>
  );
}
