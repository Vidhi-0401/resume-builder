"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", previewUrl: "" });
  const router = useRouter();

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  const handleAdd = async () => {
    // quick add minimal template (admin can edit layout later)
    const body = { name: form.name, previewUrl: form.previewUrl, layout: { sections: [] }, };
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const t = await res.json();
      setTemplates([t, ...templates]);
      setForm({ name: "", previewUrl: "" });
      router.push(`/admin/templates/builder?id=${t._id}`); // open builder to edit layout
    } else {
      const err = await res.json();
      alert(err.error || "Failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Templates</h1>

      <div className="mb-6 flex gap-2">
        <input placeholder="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2" />
        <input placeholder="Preview URL (optional)" value={form.previewUrl} onChange={(e) => setForm({ ...form, previewUrl: e.target.value })} className="border p-2" />
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded">Add & Open Builder</button>
      </div>

      <ul className="space-y-3">
        {templates.map((t) => (
          <li key={t._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-600">{t._id}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push(`/admin/templates/builder?id=${t._id}`)} className="px-3 py-1 bg-yellow-500 text-white rounded">Builder</button>
              <button onClick={async () => { if (!confirm("Delete?")) return; const res = await fetch(`/api/templates/${t._id}`, { method: "DELETE" }); if (res.ok) setTemplates(templates.filter(x => x._id !== t._1)); }} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
