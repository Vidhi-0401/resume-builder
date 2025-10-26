"use client";

import { useParams } from "next/navigation";
import { ResumeProvider } from "@/context/Resumecontext";
import ResumeForm from "@/components/resumeForm";
import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import Template1 from "@/app/templates/template1";
import Template2 from "@/app/templates/template2";
import Template3 from "@/app/templates/template3";
import TemplateRenderer from "@/components/TemplateRenderer";
import ResumeOverlay from "@/components/ResumeOverlay";

export default function ResumeEditor() {
  const { id } = useParams(); // templateId
  const componentRef = useRef<HTMLDivElement>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);

  // ✅ Updated handlePrint — now includes overlay images in PDF
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "My_Resume",
    onBeforePrint: async () => {
      // Hide overlay tools only
      document
        .querySelectorAll(".resume-overlay-tools")
        .forEach((el) => ((el as HTMLElement).style.display = "none"));

      // Clone all draggable overlay images into the resume area
      const fgLayer = document.querySelector(".resume-overlay-fg-root");
      const resumeArea = componentRef.current;

      if (fgLayer && resumeArea) {
        // Remove old print clones if any
        resumeArea.querySelectorAll(".print-overlay-img").forEach((el) => el.remove());

        fgLayer.querySelectorAll("img").forEach((imgEl) => {
          const clone = imgEl.cloneNode(true) as HTMLImageElement;
          const parentRnd = imgEl.closest(".react-draggable, .react-rnd");
          const rect = parentRnd?.getBoundingClientRect();
          const resumeRect = resumeArea.getBoundingClientRect();

          if (rect && resumeRect) {
            Object.assign(clone.style, {
              position: "absolute",
              left: `${rect.left - resumeRect.left}px`,
              top: `${rect.top - resumeRect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              objectFit: "cover",
              borderRadius: (imgEl as HTMLElement).style.borderRadius,
              zIndex: "0",
            });
            clone.classList.add("print-overlay-img");
            resumeArea.appendChild(clone);
          }
        });
      }
    },
    onAfterPrint: async () => {
      // Restore overlay tools and clean up print clones
      document
        .querySelectorAll(".resume-overlay-tools")
        .forEach((el) => ((el as HTMLElement).style.display = ""));
      componentRef.current
        ?.querySelectorAll(".print-overlay-img")
        .forEach((el) => el.remove());
    },
  });

  // 🔄 Load templates from DB
  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch((err) => console.error("Error fetching templates:", err));
  }, []);

  // 🔄 Load saved resumes
  useEffect(() => {
    fetch("/api/resume")
      .then((res) => res.json())
      .then((data) => setResumes(data))
      .catch((err) => console.error("Error fetching resumes:", err));
  }, []);

  // 🗑️ Delete resume
  const handleDelete = async (resumeId: string) => {
    const res = await fetch(`/api/resume/${resumeId}`, { method: "DELETE" });
    if (res.ok) {
      setResumes(resumes.filter((r) => r._id !== resumeId));
    } else {
      alert("❌ Failed to delete resume");
    }
  };

  // 🎨 Render selected template
  const renderTemplate = () => {
    if (id === "template1") return <Template1 />;
    if (id === "template2") return <Template2 />;
    if (id === "template3") return <Template3 />;

    const template = templates.find((t) => t._id === id);
    if (!template) return <p>Loading template...</p>;

    return <TemplateRenderer template={template} />;
  };

  return (
    <ResumeProvider>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <ResumeForm
          templateId={id as string}
          resumeId={editingResumeId ?? undefined}
        />

        {/* Resume Preview Area */}
        <div className="shadow-lg p-4 relative" ref={componentRef}>
          {renderTemplate()}
        </div>

        {/* Overlay for draggable images */}
        <ResumeOverlay targetRef={componentRef} />
      </div>

      {/* ✅ Download Buttons */}
      <div className="text-center mt-6">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg mr-4"
        >
          Download PDF
        </button>

        {/* 🟢 Download Word */}
        <button
          onClick={() => {
            const element = componentRef.current;
            if (!element) return;

            import("docx").then(({ Document, Packer, Paragraph, TextRun }) => {
              const doc = new Document({
                sections: [
                  {
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: element.innerText || "Your Resume Content",
                            font: "Arial",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  },
                ],
              });

              Packer.toBlob(doc).then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "My_Resume.docx";
                a.click();
                window.URL.revokeObjectURL(url);
              });
            });
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg mr-4"
        >
          Download Word
        </button>

        {/* 🟣 Download as Image */}
        {/* 🟣 Download as Image */}
        <button
          onClick={async () => {
            const element = componentRef.current;
            if (!element) return alert("Resume not found!");

            try {
              const htmlToImage = await import("html-to-image");

              // Clone overlay images into the resume area temporarily (like for PDF)
              const fgLayer = document.querySelector(".resume-overlay-fg-root");
              const resumeArea = componentRef.current;
              let clones: HTMLElement[] = [];

              if (fgLayer && resumeArea) {
                fgLayer.querySelectorAll("img").forEach((imgEl) => {
                  const clone = imgEl.cloneNode(true) as HTMLImageElement;
                  const parentRnd = imgEl.closest(".react-draggable, .react-rnd");
                  const rect = parentRnd?.getBoundingClientRect();
                  const resumeRect = resumeArea.getBoundingClientRect();

                  if (rect && resumeRect) {
                    Object.assign(clone.style, {
                      position: "absolute",
                      left: `${rect.left - resumeRect.left}px`,
                      top: `${rect.top - resumeRect.top}px`,
                      width: `${rect.width}px`,
                      height: `${rect.height}px`,
                      objectFit: "cover",
                      borderRadius: (imgEl as HTMLElement).style.borderRadius,
                      zIndex: "0",
                    });
                    clone.classList.add("print-overlay-img");
                    resumeArea.appendChild(clone);
                    clones.push(clone);
                  }
                });
              }

              // Generate PNG using html-to-image
              const dataUrl = await htmlToImage.toPng(element, {
                backgroundColor: "#ffffff",
                pixelRatio: 2,
                cacheBust: true,
              });

              // Download the PNG
              const link = document.createElement("a");
              link.download = "My_Resume.png";
              link.href = dataUrl;
              link.click();

              // Remove cloned overlay images after export
              clones.forEach((c) => c.remove());
            } catch (err) {
              console.error("⚠️ Image generation failed:", err);
              alert("⚠️ Could not render resume. Please try again.");
            }
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Download Image
        </button>

      </div>

      {/* 🔹 Saved Resumes Section */}
      <div className="mt-10 p-6 border-t">
        <h2 className="text-lg font-bold mb-4">Your Saved Resumes</h2>
        {resumes.length === 0 ? (
          <p>No resumes yet. Save one above!</p>
        ) : (
          <ul className="space-y-2">
            {resumes.map((resume) => (
              <li
                key={resume._id}
                className="p-3 border rounded flex justify-between items-center"
              >
                <span>
                  {resume.name} ({resume.templateId})
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setEditingResumeId(resume._id)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(resume._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ResumeProvider>
  );
}
