"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "@/components/dnd/SortableItem";

type SectionDef = {
  id: string; // key that matches Resume schema
  label: string;
};

type PlacedSection = {
  uid: string; // unique instance id for drag/drop
  id: string; // logical id (schema key)
  label: string; // human label
};

// ✅ Map of available sections (linked to Resume schema)
const AVAILABLE: SectionDef[] = [
  { id: "profile", label: "Profile" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "languages", label: "Languages" },
  { id: "hobbies", label: "Hobbies" },
  { id: "contact", label: "Contact Info" }, // maps name/email/phone
  { id: "links", label: "Links (LinkedIn/GitHub)" },
];

function makeUid(base: string) {
  return `${base}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export default function TemplateBuilderPage() {
  const search = useSearchParams();
  const router = useRouter();
  const templateId = search?.get("id") ?? undefined;

  const [template, setTemplate] = useState<any | null>(null);
  const [sections, setSections] = useState<PlacedSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!templateId) return;
    // fetch template by id
    fetch(`/api/templates/${templateId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch template");
        return r.json();
      })
      .then((t) => {
        setTemplate(t);
        // normalize existing layout sections
        const existing: PlacedSection[] =
          (t?.layout?.sections || []).map((s: any) =>
            typeof s === "string"
              ? { uid: makeUid(s), id: s, label: s }
              : {
                  uid: s.uid ?? makeUid(s.id),
                  id: s.id,
                  label: s.label ?? s.id,
                }
          ) || [];
        setSections(existing);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load template");
      });
  }, [templateId]);

  // add a new section
  const handleAdd = (def: SectionDef) => {
    setSections((prev) => [
      ...prev,
      { uid: makeUid(def.id), id: def.id, label: def.label },
    ]);
  };

  // remove by uid
  const handleRemove = (uid: string) => {
    setSections((prev) => prev.filter((s) => s.uid !== uid));
  };

  // reorder sections
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.uid === active.id);
      const newIndex = prev.findIndex((s) => s.uid === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // Save layout
  const handleSave = async () => {
    if (!templateId || !template) return;
    setSaving(true);
    setError(null);

    // ✅ Store layout in format linked to Resume model
    const layout = {
      sections: sections.map((s) => ({
        id: s.id, // schema key like "education"
        label: s.label, // UI label
      })),
    };

    try {
      const body = { ...template, layout };
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        throw new Error(err?.error || "Save failed");
      }

      const updated = await res.json();
      setTemplate(updated);
      alert("Template layout saved!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Save failed");
      alert("Save failed: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (!templateId) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">No template selected</h2>
        <p>Open this page with ?id=templateId</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Template Builder</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/templates")}
            className="px-3 py-2 bg-blue-400 rounded"
          >
            Back to list
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded text-white ${
              saving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Sections */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-3">Available Sections</h2>
          <div className="space-y-2">
            {AVAILABLE.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="py-2">{s.label}</div>
                <button
                  onClick={() => handleAdd(s)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-3">Layout (drag to reorder)</h2>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.uid)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sections.map((s) => (
                  <SortableItem
                    key={s.uid}
                    uid={s.uid}
                    label={s.label}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-4 text-sm text-gray-600">
            Tip: add sections and drag to reorder. Use ✕ to remove.
          </div>
        </div>
      </div>
    </div>
  );
}
