"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Pencil, Eye, PlusCircle } from "lucide-react";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", previewUrl: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const router = useRouter();

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) throw new Error("Failed to load templates");
        const data = await res.json();
        setTemplates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Add new template
  const handleAdd = async () => {
    if (!form.name.trim()) {
      alert("Template name is required");
      return;
    }
    try {
      setLoading(true);
      const body = {
        name: form.name,
        previewUrl: form.previewUrl,
        layout: { sections: [] },
      };
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const t = await res.json();
        setTemplates((prev) => [t, ...prev]);
        setForm({ name: "", previewUrl: "" });
        router.push(`/admin/templates/builder?id=${t._id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create template");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) setTemplates((prev) => prev.filter((t) => t._id !== id));
      else alert("Failed to delete template");
    } catch (err) {
      console.error(err);
    }
  };

  // Derived filtered/sorted list
  const filteredTemplates = useMemo(() => {
    const filtered = templates.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [templates, search, sortBy]);

  return (
    <div className="min-h-screen p-8 bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PlusCircle className="text-blue-400" /> Manage Templates
          </h1>
        </header>

        {/* Form Section */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            placeholder="Template name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 border border-gray-600 bg-transparent p-2 rounded-md text-white focus:outline-none focus:border-blue-500"
          />
          <input
            placeholder="Preview URL (optional)"
            value={form.previewUrl}
            onChange={(e) => setForm({ ...form, previewUrl: e.target.value })}
            className="flex-1 border border-gray-600 bg-transparent p-2 rounded-md text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
            Add & Open Builder
          </button>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-600 bg-transparent p-2 rounded-md text-white flex-1 max-w-xs"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-600 bg-transparent p-2 rounded-md text-white"
          >
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-gray-400 flex items-center justify-center py-10">
            <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading templates...
          </div>
        )}
        {error && (
          <div className="text-red-500 bg-red-900/20 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="text-gray-400 text-center py-10">
            No templates found. Add a new one above!
          </div>
        )}

        {/* Template List */}
        <ul className="space-y-3">
          {filteredTemplates.map((t) => (
            <li
              key={t._id}
              className="p-4 border border-gray-700 rounded-lg flex justify-between items-center bg-[#111111] hover:bg-[#161616] transition"
            >
              <div>
                <div className="font-semibold text-lg">{t.name}</div>
                <div className="text-xs text-gray-500">{t._id}</div>
                {t.previewUrl && (
                  <a
                    href={t.previewUrl}
                    target="_blank"
                    className="text-blue-400 text-sm hover:underline flex items-center gap-1 mt-1"
                  >
                    <Eye size={14} /> Preview
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    router.push(`/admin/templates/builder?id=${t._id}`)
                  }
                  className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center gap-1"
                >
                  <Pencil size={14} /> Builder
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
