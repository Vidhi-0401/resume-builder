"use client";
import { useParams } from "next/navigation";
import { ResumeProvider } from "@/context/Resumecontext";
import ResumeForm from "@/components/resumeForm";
import Template1 from "@/app/templates/template1";
import Template2 from "@/app/templates/template2";
import Template3 from "@/app/templates/template3";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function ResumeEditor() {
  const { id } = useParams();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,  
    documentTitle: "My_Resume",
  });

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
        <ResumeForm templateId={id as string} />

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
    </ResumeProvider>
  );
}
