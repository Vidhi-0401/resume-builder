"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { ResumeProvider } from "@/context/Resumecontext";
import Template1 from "@/app/templates/template1";
import Template2 from "@/app/templates/template2";
import Template3 from "@/app/templates/template3";
import AIModal from "@/components/AIModal";

const TemplateRenderer = dynamic(() => import("@/components/TemplateRenderer"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-72 text-gray-500">
      Loading preview...
    </div>
  ),
});

const manualTemplates = [
  {
    id: "template1",
    name: "Template 1",
    style: "Classic",
    component: (
      <ResumeProvider>
        <Template1 />
      </ResumeProvider>
    ),
  },
  {
    id: "template2",
    name: "Template 2",
    style: "Modern",
    component: (
      <ResumeProvider>
        <Template2 />
      </ResumeProvider>
    ),
  },
  {
    id: "template3",
    name: "Template 3",
    style: "Creative",
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
  const [showAIModal, setShowAIModal] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => setAdminTemplates(data))
      .catch((err) => console.error("Error fetching templates:", err));
  }, []);

  const filteredAdminTemplates = adminTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      t.layout?.style?.layoutType?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-900">
          Choose a Resume Template
        </h1>

        {/* --- Actions (Create + AI Generate) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center mb-12">
          <div
            role="button"
            onClick={() => router.push("/editor/blank")}
            className="cursor-pointer rounded-xl border border-dashed border-gray-300 bg-white p-8 flex flex-col items-center justify-center hover:shadow-xl hover:border-indigo-400 transition min-h-[300px]"
          >
            <div className="text-6xl text-indigo-600 font-bold">+</div>
            <div className="mt-4 text-xl font-semibold text-gray-800">
              Create Your Own Resume
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center max-w-xs">
              Start from blank — drag, drop & design your layout
            </p>
          </div>

          <div
            role="button"
            onClick={() => setShowAIModal(true)}
            className="cursor-pointer rounded-xl border border-dashed border-gray-300 bg-white p-8 flex flex-col items-center justify-center hover:shadow-xl hover:border-purple-400 transition min-h-[300px]"
          >
            <div className="text-6xl text-purple-600 font-bold">✨</div>
            <div className="mt-4 text-xl font-semibold text-gray-800">
              Generate with AI
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center max-w-xs">
              Let AI create a personalized starter resume for you
            </p>
          </div>
        </div>

        {/* --- Search & Filter --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-1/2 border border-gray-300 rounded-lg p-2 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          />

          {/* Filter Buttons */}
          <div className="flex gap-3 flex-wrap justify-center">
            {["All", "Modern", "Classic", "Creative"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition border ${
                  filter === cat
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Template Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Manual Templates */}
          {manualTemplates.map((t) => (
            <div
              key={t.id}
              className="cursor-pointer rounded-xl shadow-md bg-white hover:shadow-xl hover:scale-[1.03] transition-transform"
              onClick={() => setPreviewTemplate(t)}
            >
              <div className="h-72 overflow-hidden p-2 flex justify-center items-start bg-gray-50 rounded-t-xl">
                <div className="scale-90 w-full text-gray-900">{t.component}</div>
              </div>
              <div className="p-4 border-t">
                <h2 className="text-lg font-semibold text-gray-900">{t.name}</h2>
                <p className="text-sm text-gray-600">{t.style} Template</p>
              </div>
            </div>
          ))}

          {/* Admin Templates */}
          {filteredAdminTemplates.map((t) => (
            <div
              key={t._id}
              className="cursor-pointer rounded-xl shadow-md bg-white hover:shadow-xl hover:scale-[1.03] transition-transform"
              onClick={() => setPreviewTemplate(t)}
            >
              <div className="h-72 overflow-hidden p-2 flex justify-center items-start bg-gray-50 rounded-t-xl">
                <Suspense
                  fallback={
                    <div className="flex justify-center items-center h-full text-gray-400">
                      Loading...
                    </div>
                  }
                >
                  <div className="scale-90 w-full text-gray-900">
                    <ResumeProvider>
                      <TemplateRenderer template={t} />
                    </ResumeProvider>
                  </div>
                </Suspense>
              </div>
              <div className="p-4 border-t">
                <h2 className="text-lg font-semibold text-gray-900">{t.name}</h2>
                {/* ✅ FIXED LINE */}
                <p className="text-sm text-gray-600">
                  {t.layout?.style?.layoutType || "Custom"} · Admin Template
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- Empty State --- */}
        {filteredAdminTemplates.length === 0 && query && (
          <div className="text-center text-gray-500 mt-10">
            No templates match your search.
          </div>
        )}
      </div>

      {/* --- Preview Modal --- */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-3xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-gray-900 text-center">
              {previewTemplate.name}
            </h2>

            <div className="border rounded-lg p-4 bg-gray-50">
              {previewTemplate.component ? (
                previewTemplate.component
              ) : (
                <ResumeProvider>
                  <TemplateRenderer template={previewTemplate} />
                </ResumeProvider>
              )}
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() =>
                  router.push(
                    `/editor/${previewTemplate.id || previewTemplate._id}`
                  )
                }
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AI Modal --- */}
      {showAIModal && <AIModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}
 