"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ResumeProvider } from "@/context/Resumecontext";
import Template1 from "@/app/templates/template1";
import Template2 from "@/app/templates/template2";
import Template3 from "@/app/templates/template3";
import TemplateRenderer from "@/components/TemplateRenderer";
import AIModal from "@/components/AIModal"; // 👈 Import AI modal component

// Hardcoded manual templates
const manualTemplates = [
  {
    id: "template1",
    name: "Template 1",
    component: (
      <ResumeProvider>
        <Template1 />
      </ResumeProvider>
    ),
  },
  {
    id: "template2",
    name: "Template 2",
    component: (
      <ResumeProvider>
        <Template2 />
      </ResumeProvider>
    ),
  },
  {
    id: "template3",
    name: "Template 3",
    component: (
      <ResumeProvider>
        <Template3 />
      </ResumeProvider>
    ),
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [adminTemplates, setAdminTemplates] = useState<any[]>([]);
  const [showAIModal, setShowAIModal] = useState(false); // 👈 AI modal state

  // Load admin-created templates from DB
  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setAdminTemplates(data))
      .catch((err) => console.error("Error fetching templates:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
        Choose a Resume Template
      </h1>

      {/* --- Section: Create or AI Generate --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center mb-8">
        {/* --- Create Your Own card --- */}
        <div
          role="button"
          onClick={() => router.push("/editor/blank")}
          className="cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white p-6 flex flex-col items-center justify-center hover:shadow-lg transition"
          style={{ minHeight: 300 }}
        >
          <div className="text-6xl text-indigo-600 font-bold">+</div>
          <div className="mt-4 text-xl font-semibold">Create Your Own Resume</div>
          <div className="text-sm text-gray-500 mt-1">
            Start from blank — drag, drop & design
          </div>
        </div>

        {/* --- ✨ Generate with AI card --- */}
        <div
          role="button"
          onClick={() => setShowAIModal(true)}
          className="cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white p-6 flex flex-col items-center justify-center hover:shadow-lg transition"
          style={{ minHeight: 300 }}
        >
          <div className="text-6xl text-purple-600 font-bold">✨</div>
          <div className="mt-4 text-xl font-semibold">Generate with AI</div>
          <div className="text-sm text-gray-500 mt-1">
            Let AI create a starter resume for you
          </div>
        </div>
      </div>

      {/* --- Section: Templates Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Render manual templates */}
        {manualTemplates.map((t) => (
          <div
            key={t.id}
            className="cursor-pointer rounded-xl shadow-lg bg-white hover:scale-105 transition-transform"
            onClick={() => router.push(`/editor/${t.id}`)}
          >
            <div className="h-72 overflow-hidden p-2 flex justify-center items-start bg-gray-100 rounded-t-xl">
              <div className="scale-90 w-full text-gray-900">{t.component}</div>
            </div>
            <div className="p-4 border-t">
              <h2 className="text-xl font-semibold text-gray-900">{t.name}</h2>
              <p className="mt-2 text-gray-800">Click to customize</p>
            </div>
          </div>
        ))}

        {/* Render admin-created templates */}
        {adminTemplates.map((t) => (
          <div
            key={t._id}
            className="cursor-pointer rounded-xl shadow-lg bg-white hover:scale-105 transition-transform"
            onClick={() => router.push(`/editor/${t._id}`)}
          >
            <div className="h-72 overflow-hidden p-2 flex justify-center items-start bg-gray-100 rounded-t-xl">
              <div className="scale-90 w-full text-gray-900">
                <ResumeProvider>
                  <TemplateRenderer template={t} />
                </ResumeProvider>
              </div>
            </div>
            <div className="p-4 border-t">
              <h2 className="text-xl font-semibold text-gray-900">{t.name}</h2>
              <p className="mt-2 text-gray-800">Admin-created template</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- AI Modal Popup --- */}
      {showAIModal && <AIModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}
