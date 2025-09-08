"use client";
import { useParams } from "next/navigation";
import { ResumeProvider } from "@/context/Resumecontext";
import ResumeForm from "@/components/resumeForm";
import Template1 from "@/app/templates/template1";
import Template2 from "@/app/templates/template2";
import Template3 from "@/app/templates/template3";
import { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";

export default function ResumeEditor() {
  const { id } = useParams();
  const componentRef = useRef<HTMLDivElement>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);

  // ✅ Print setup
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "My_Resume",
  });

  // ✅ Load saved resumes
  useEffect(() => {
    fetch("/api/resume")
      .then((res) => res.json())
      .then((data) => setResumes(data))
      .catch((err) => console.error("Error fetching resumes:", err));
  }, []);

  // ✅ Handle delete
  const handleDelete = async (resumeId: string) => {
    const res = await fetch(`/api/resume/${resumeId}`, { method: "DELETE" });
    if (res.ok) {
      setResumes(resumes.filter((r) => r._id !== resumeId));
    } else {
      alert("❌ Failed to delete resume");
    }
  };

  const renderTemplate = () => {
    switch (id) {
      case "template1":
        return <Template1 />;
      case "template2":
        return <Template2 />;
      case "template3":
        return <Template3 />;
      default:
        return <p className="text-center text-red-600">Template not found</p>;
    }
  };

  return (
    <ResumeProvider>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <ResumeForm templateId={id as string} resumeId={editingResumeId ?? undefined} />

        <div className="shadow-lg p-4" ref={componentRef}>
          {renderTemplate()}
        </div>
      </div>

      {/* PDF Download Button */}
      <div className="text-center mt-6">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Download PDF
        </button>
      </div>

      {/* ✅ Saved Resumes Section */}
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
