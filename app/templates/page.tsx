"use client";
import { useRouter } from "next/navigation";
import { ResumeProvider } from "@/context/Resumecontext"; // import provider
import Template1 from "@/app/templates/template1";
import Template2 from "@/app/templates/template2";
import Template3 from "@/app/templates/template3";

const templates = [
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
  }
];

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-6">
        Choose a Resume Template
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div
            key={t.id}
            className="cursor-pointer rounded-xl shadow-lg bg-white hover:scale-105 transition-transform"
            onClick={() => router.push(`/editor/${t.id}`)}
          >
            {/* Preview box */}
            <div className="h-72 overflow-hidden p-2 flex justify-center items-start bg-gray-50 rounded-t-xl">
              <div className="scale-90 w-full">{t.component}</div>
            </div>

            {/* Template info */}
            <div className="p-4 border-t">
              <h2 className="text-xl font-semibold">{t.name}</h2>
              <p className="mt-2 text-gray-600">Click to customize</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
