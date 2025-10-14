// app/blank/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

type ElemType = "text" | "rect" | "circle" | "line" | "photo";

type Elem = {
  id: string;
  type: ElemType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  background?: string;
  borderRadius?: string;
};

type Page = {
  id: string;
  elements: Elem[];
};

const genId = (prefix = "") =>
  `${prefix}${Math.random().toString(36).slice(2, 9)}`;

/* ------------------------------
   Slide-in AI Assistant Panel
--------------------------------*/
function AIPanelSlideOver({
  open,
  onClose,
  pages,
  selectedText,
  updateElement,
}: {
  open: boolean;
  onClose: () => void;
  pages: Page[];
  selectedText: string;
  updateElement: (update: (el: Elem) => Elem) => void;
}) {
  const [action, setAction] = useState("");
  const [section, setSection] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const handleAI = async () => {
    if (!action) return alert("Select an action!");
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          section: section || "objective",
          context: { pages, selectedText, jobRole },
        }),
      });

      const data = await res.json();
      if (data?.text) {
        setResult(data.text);
      } else {
        setResult("No content returned.");
      }
    } catch (err) {
      console.error(err);
      setResult("AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  const applyToSelected = () => {
    if (!result) return;
    updateElement((el) => ({ ...el, text: result }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${
          open ? "bg-black/40 opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-full max-w-md transform bg-gray-900 text-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Assistant"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 ring-1 ring-gray-700">
              ✨
            </span>
            <h3 className="text-lg font-semibold">AI Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-gray-300 hover:bg-gray-800 hover:text-white"
            aria-label="Close AI Assistant"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Action
            </label>
            <select
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="">Select action</option>
              <option value="generate_section">Generate Section</option>
              <option value="suggest_skills">Suggest Skills</option>
              <option value="proofread">Proofread Text</option>
              <option value="layout_optimize">Optimize Layout</option>
              <option value="resume_summary">Resume Summary</option>
              <option value="job_match">Job Match</option>
            </select>
          </div>

          {action === "generate_section" && (
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Section (e.g., Objective / Experience / Education)
              </label>
              <input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none"
                placeholder="Objective"
              />
            </div>
          )}

          {action === "job_match" && (
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Job role / description
              </label>
              <input
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none"
                placeholder="Frontend Engineer at X (React, Next.js)"
              />
            </div>
          )}

          <div className="rounded-md bg-gray-800/60 p-3 text-xs text-gray-300">
            <div className="mb-1 font-semibold text-gray-200">
              Selected Text Context
            </div>
            <div className="line-clamp-3 whitespace-pre-wrap">
              {selectedText || "— (no text element selected) —"}
            </div>
          </div>

          <button
            onClick={handleAI}
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Run AI"}
          </button>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              AI Result
            </label>
            <textarea
              className="h-40 w-full resize-none rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="AI output will appear here..."
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result || "");
                }}
                className="rounded-md px-3 py-1 text-sm text-gray-300 ring-1 ring-gray-700 hover:bg-gray-800"
              >
                Copy
              </button>
              <button
                onClick={applyToSelected}
                disabled={!result}
                className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Apply to selected element
              </button>
            </div>
          </div>

          <div className="pt-1 text-xs text-gray-500">
            Tip: select a text element on the canvas to overwrite it with the AI
            result.
          </div>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------
          Main Editor
--------------------------------*/
export default function BlankEditor() {
  // canvas state
  const [pages, setPages] = useState<Page[]>([
    { id: genId("page-"), elements: [] },
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    origX?: number;
    origY?: number;
    origWidth?: number;
    origHeight?: number;
    resizing?: boolean;
  } | null>(null);

  // saved / API integration (kept, but you can hide lists elsewhere)
  const [resumes, setResumes] = useState<any[]>([]);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string>("");
  const [loadingSave, setLoadingSave] = useState(false);

  // printing
  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "My_Custom_Resume",
  });

  // AI slide-over visibility
  const [showAI, setShowAI] = useState(false);

  // drag/resize handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      setPages((prev) => {
        const copy = [...prev];
        copy[currentPageIndex] = {
          ...copy[currentPageIndex],
          elements: copy[currentPageIndex].elements.map((el) => {
            if (el.id !== dragState.id) return el;
            if (dragState.resizing) {
              return {
                ...el,
                width: Math.max(20, (dragState.origWidth || el.width) + dx),
                height: Math.max(20, (dragState.origHeight || el.height) + dy),
              };
            } else {
              return {
                ...el,
                x: (dragState.origX || el.x) + dx,
                y: (dragState.origY || el.y) + dy,
              };
            }
          }),
        };
        return copy;
      });
    };
    const onUp = () => setDragState(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragState, currentPageIndex]);

  const updateElement = (update: (el: Elem) => Elem) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[currentPageIndex] = {
        ...copy[currentPageIndex],
        elements: copy[currentPageIndex].elements.map((el) =>
          el.id === selectedId ? update(el) : el
        ),
      };
      return copy;
    });
  };

  const addElement = (type: ElemType) => {
    const newEl: Elem = {
      id: genId("el-"),
      type,
      x: 60,
      y: 60,
      width: 180,
      height: type === "text" ? 40 : 100,
      text: type === "text" ? "Double-click to edit" : undefined,
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#111827",
      background: type === "text" ? "transparent" : "#E5E7EB",
    };
    setPages((prev) => {
      const copy = [...prev];
      copy[currentPageIndex] = {
        ...copy[currentPageIndex],
        elements: [...copy[currentPageIndex].elements, newEl],
      };
      return copy;
    });
    setSelectedId(newEl.id);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setPages((prev) => {
      const copy = [...prev];
      copy[currentPageIndex] = {
        ...copy[currentPageIndex],
        elements: copy[currentPageIndex].elements.filter(
          (e) => e.id !== selectedId
        ),
      };
      return copy;
    });
    setSelectedId(null);
  };

  const onElementMouseDown = (e: React.MouseEvent, el: Elem) => {
    e.stopPropagation();
    setSelectedId(el.id);
    setDragState({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    });
  };

  const onResizeMouseDown = (e: React.MouseEvent, el: Elem) => {
    e.stopPropagation();
    setSelectedId(el.id);
    setDragState({
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origWidth: el.width,
      origHeight: el.height,
      resizing: true,
    });
  };

  const addPage = () => {
    setPages((prev) => [...prev, { id: genId("page-"), elements: [] }]);
    setCurrentPageIndex(pages.length);
    setSelectedId(null);
  };

  const goToPage = (idx: number) => {
    setCurrentPageIndex(idx);
    setSelectedId(null);
  };

  const currentPage = pages[currentPageIndex];

  // saved list fetch (logic kept; UI list can be hidden elsewhere if desired)
  useEffect(() => {
    fetch("/api/resume")
      .then((r) => r.json())
      .then((data) => {
        setResumes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching saved resumes:", err);
        setResumes([]);
      });
  }, []);

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      const payload = {
        name: resumeName || "Untitled Resume",
        templateId: "blank",
        pages,
      };

      const method = editingResumeId ? "PUT" : "POST";
      const url = editingResumeId
        ? `/api/resume/${editingResumeId}`
        : "/api/resume";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      const saved = await res.json();

      if (editingResumeId) {
        setResumes((prev) => prev.map((r) => (r._id === saved._id ? saved : r)));
      } else {
        setResumes((prev) => [saved, ...prev]);
      }

      setEditingResumeId(saved._id);
      alert("✅ Saved resume");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save resume");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/resume/${id}`);
      if (!res.ok) throw new Error("Failed to load resume");
      const saved = await res.json();
      setPages(
        saved.pages && saved.pages.length
          ? saved.pages
          : [{ id: genId("page-"), elements: [] }]
      );
      setCurrentPageIndex(0);
      setResumeName(saved.name || "");
      setEditingResumeId(saved._id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load resume");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved resume?")) return;
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setResumes((prev) => prev.filter((r) => r._id !== id));
      if (editingResumeId === id) {
        setEditingResumeId(null);
        setResumeName("");
        setPages([{ id: genId("page-"), elements: [] }]);
        setCurrentPageIndex(0);
      }
      alert("✅ Deleted");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-full mx-auto">
        {/* header */}
        <div className="relative mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Create Your Own Resume — Blank Canvas
          </h2>

          <div className="space-x-2">
            <input
              placeholder="Resume name"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              className="mr-2 rounded border px-3 py-2"
            />
            <button
              onClick={addPage}
              className="rounded-md bg-green-600 px-3 py-2 text-white shadow"
            >
              ➕ Add Page
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-emerald-600 px-3 py-2 text-white shadow disabled:opacity-50"
              disabled={loadingSave}
            >
              {loadingSave ? "Saving..." : editingResumeId ? "Update Save" : "Save Resume"}
            </button>
            <button
              onClick={handlePrint}
              className="rounded-md bg-blue-600 px-3 py-2 text-white shadow"
            >
              Download PDF
            </button>
          </div>

          {/* Floating AI Button (left edge, mid-screen) */}
          <button
            onClick={() => setShowAI(true)}
            title="Open AI Assistant"
            className="fixed left-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white shadow-xl ring-2 ring-gray-700 transition-transform hover:scale-110 hover:ring-indigo-500"
            aria-label="Open AI Assistant"
          >
            ✨
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Tools */}
          <aside className="rounded bg-gray-800 p-4 shadow md:col-span-1">
            <h3 className="mb-2 font-semibold text-white">Tools</h3>
            <div className="space-y-2">
              <button
                onClick={() => addElement("text")}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              >
                Add Text
              </button>
              <button
                onClick={() => addElement("rect")}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              >
                Add Rectangle
              </button>
              <button
                onClick={() => addElement("circle")}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              >
                Add Circle
              </button>
              <button
                onClick={() => addElement("line")}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              >
                Add Line
              </button>

              {/* Add Photo */}
              <input
                type="file"
                accept="image/png, image/jpeg"
                id="photo-upload"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const newEl: Elem = {
                      id: genId("el-"),
                      type: "photo",
                      x: 60,
                      y: 60,
                      width: 150,
                      height: 150,
                      background: reader.result as string,
                    };
                    setPages((prev) => {
                      const copy = [...prev];
                      copy[currentPageIndex] = {
                        ...copy[currentPageIndex],
                        elements: [...copy[currentPageIndex].elements, newEl],
                      };
                      return copy;
                    });
                    setSelectedId(newEl.id);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => document.getElementById("photo-upload")?.click()}
                className="w-full rounded border border-gray-600 px-3 py-2 text-white"
              >
                Add Photo
              </button>
            </div>

            {/* Selected element */}
            <div className="mt-6">
              <h4 className="font-semibold text-white">Selected</h4>
              {!selectedId ? (
                <div className="mt-2 text-sm text-gray-300">
                  No element selected
                </div>
              ) : (
                <>
                  <div className="mt-2 text-sm text-white">Font family</div>
                  <select
                    className="w-full rounded border border-gray-700 bg-gray-700 px-2 py-1 text-white"
                    onChange={(e) =>
                      updateElement((el) => ({ ...el, fontFamily: e.target.value }))
                    }
                    value={
                      currentPage.elements.find((el) => el.id === selectedId)
                        ?.fontFamily || "Arial, sans-serif"
                    }
                  >
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Noto Sans', sans-serif">Noto Sans</option>
                    <option value="'Times New Roman', serif">
                      Times New Roman
                    </option>
                    <option value="'Georgia', serif">Georgia</option>
                  </select>

                  <div className="mt-2 text-sm text-white">Font size</div>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-700 bg-gray-700 px-2 py-1 text-white"
                    onChange={(e) =>
                      updateElement((el) => ({
                        ...el,
                        fontSize: Number(e.target.value) || 12,
                      }))
                    }
                    value={
                      currentPage.elements.find((el) => el.id === selectedId)
                        ?.fontSize || 16
                    }
                  />

                  <div className="mt-2 text-sm text-white">Text color</div>
                  <input
                    type="color"
                    className="h-8 w-full p-0"
                    onChange={(e) =>
                      updateElement((el) => ({ ...el, color: e.target.value }))
                    }
                    value={
                      currentPage.elements.find((el) => el.id === selectedId)
                        ?.color || "#111827"
                    }
                  />

                  <div className="mt-2 text-sm text-white">Background</div>
                  <input
                    type="color"
                    className="h-8 w-full p-0"
                    onChange={(e) =>
                      updateElement((el) => ({
                        ...el,
                        background: e.target.value,
                      }))
                    }
                    value={
                      currentPage.elements.find((el) => el.id === selectedId)
                        ?.background || "#00000000"
                    }
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => removeSelected()}
                      className="rounded bg-red-500 px-3 py-1 text-white"
                    >
                      Delete
                    </button>

                    {currentPage.elements.find((el) => el.id === selectedId)
                      ?.type === "photo" && (
                      <>
                        <div className="mt-2 text-sm text-white">Shape</div>
                        <select
                          className="w-full rounded border border-gray-700 bg-gray-700 px-2 py-1 text-white"
                          onChange={(e) =>
                            updateElement((el) => ({
                              ...el,
                              borderRadius: e.target.value,
                            }))
                          }
                          value={
                            currentPage.elements.find(
                              (el) => el.id === selectedId
                            )?.borderRadius || "0"
                          }
                        >
                          <option value="0">Square/Rectangle</option>
                          <option value="50%">Circle</option>
                        </select>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* page buttons */}
            <div className="mt-6">
              <h4 className="mb-2 font-semibold text-white">Pages</h4>
              <div className="flex gap-2">
                {pages.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => goToPage(i)}
                    className={`rounded border px-3 py-1 ${
                      i === currentPageIndex
                        ? "bg-indigo-600 text-white"
                        : "text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Canvas */}
          <main className="md:col-span-3 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="rounded bg-white p-3 shadow">
                  <div className="mb-2 text-sm text-gray-500">
                    Canvas (drag items to reposition / resize)
                  </div>

                  <div
                    className="mx-auto border bg-white"
                    style={{
                      width: 794,
                      height: 1123,
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseDown={() => setSelectedId(null)}
                  >
                    {currentPage.elements.map((el) => {
                      const isSelected = selectedId === el.id;
                      const baseStyle: React.CSSProperties = {
                        position: "absolute",
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        cursor: dragState?.resizing ? "nwse-resize" : "move",
                        userSelect: "none",
                        boxSizing: "border-box",
                        border: isSelected ? "2px dashed #2563eb" : "none",
                      };

                      const resizeHandleStyle: React.CSSProperties = {
                        width: 10,
                        height: 10,
                        background: "#2563eb",
                        position: "absolute",
                        right: -5,
                        bottom: -5,
                        cursor: "nwse-resize",
                      };

                      if (el.type === "text") {
                        const isEditing = editingId === el.id;

                        return (
                          <div
                            key={el.id}
                            style={{
                              ...baseStyle,
                              fontSize: el.fontSize,
                              fontFamily: el.fontFamily,
                              color: el.color,
                              background:
                                el.background === "transparent"
                                  ? "transparent"
                                  : el.background,
                              padding: 4,
                              overflow: "hidden",
                            }}
                            onMouseDown={(e) => onElementMouseDown(e, el)}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                autoFocus
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => {
                                  updateElement(() => ({
                                    ...el,
                                    text: editingValue,
                                  }));
                                  setEditingId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateElement(() => ({
                                      ...el,
                                      text: editingValue,
                                    }));
                                    setEditingId(null);
                                  }
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  fontSize: el.fontSize,
                                  fontFamily: el.fontFamily,
                                  color: el.color,
                                  background:
                                    el.background === "transparent"
                                      ? "transparent"
                                      : el.background,
                                  padding: 4,
                                  boxSizing: "border-box",
                                }}
                              />
                            ) : (
                              <div
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(el.id);
                                  setEditingValue(el.text || "");
                                }}
                              >
                                {el.text || "Double-click to edit"}
                              </div>
                            )}

                            {isSelected && (
                              <div
                                style={resizeHandleStyle}
                                onMouseDown={(e) => onResizeMouseDown(e, el)}
                              />
                            )}
                          </div>
                        );
                      }

                      if (
                        el.type === "rect" ||
                        el.type === "circle" ||
                        el.type === "line"
                      ) {
                        return (
                          <div
                            key={el.id}
                            style={{
                              ...baseStyle,
                              background: el.background,
                              borderRadius: el.type === "circle" ? "50%" : undefined,
                              height: el.type === "line" ? 4 : el.height,
                            }}
                            onMouseDown={(e) => onElementMouseDown(e, el)}
                          >
                            {isSelected && (
                              <div
                                style={resizeHandleStyle}
                                onMouseDown={(e) => onResizeMouseDown(e, el)}
                              />
                            )}
                          </div>
                        );
                      }

                      if (el.type === "photo") {
                        return (
                          <div
                            key={el.id}
                            style={{
                              ...baseStyle,
                              background: `url(${el.background}) center/cover no-repeat`,
                              borderRadius: el.borderRadius || undefined,
                            }}
                            onMouseDown={(e) => onElementMouseDown(e, el)}
                          >
                            {isSelected && (
                              <div
                                style={resizeHandleStyle}
                                onMouseDown={(e) => onResizeMouseDown(e, el)}
                              />
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              </div>

              {/* Right info panel (kept) */}
              <div style={{ width: 240 }}>
                <div className="rounded bg-white p-3 shadow">
                  <h4 className="font-semibold">Preview / Page Tools</h4>
                  <div className="mt-3 text-sm text-gray-500">
                    Click an element to select. Double-click text to edit. Drag
                    to move. Drag bottom-right corner to resize.
                  </div>

                  {/* Example Saved list UI (you can remove visually if you don't want it) */}
                  <div className="mt-4">
                    <h5 className="font-semibold">Saved Resumes</h5>
                    <div className="mt-2 max-h-56 space-y-2 overflow-auto">
                      {resumes.length === 0 ? (
                        <div className="text-sm text-gray-400">
                          No saved resumes
                        </div>
                      ) : (
                        resumes.map((r) => (
                          <div
                            key={r._id}
                            className="flex items-center justify-between rounded bg-gray-700 p-2"
                          >
                            <div className="w-40 truncate text-sm text-white">
                              {r.name}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(r._id)}
                                className="rounded bg-yellow-500 px-2 py-1 text-sm text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(r._id)}
                                className="rounded bg-red-600 px-2 py-1 text-sm text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {pages.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => goToPage(i)}
                  className={`rounded border px-3 py-1 text-sm ${
                    i === currentPageIndex
                      ? "bg-indigo-600 text-white"
                      : "bg-white"
                  }`}
                >
                  Page {i + 1}
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Hidden print wrapper */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="print-wrapper">
          {pages.map((p) => (
            <div
              key={p.id}
              className="print-page"
              style={{
                width: 794,
                height: 1123,
                boxSizing: "border-box",
                padding: 20,
                background: "#fff",
                position: "relative",
              }}
            >
              {p.elements.map((el) => {
                if (el.type === "text") {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: "absolute",
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        fontSize: el.fontSize,
                        fontFamily: el.fontFamily,
                        color: el.color,
                        background:
                          el.background === "transparent"
                            ? "transparent"
                            : el.background,
                        padding: 6,
                        boxSizing: "border-box",
                      }}
                    >
                      {el.text}
                    </div>
                  );
                }
                if (el.type === "rect") {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: "absolute",
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        background: el.background,
                      }}
                    />
                  );
                }
                if (el.type === "circle") {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: "absolute",
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        background: el.background,
                        borderRadius: "50%",
                      }}
                    />
                  );
                }
                if (el.type === "line") {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: "absolute",
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: 4,
                        background: el.background ?? "#111",
                      }}
                    />
                  );
                }
                if (el.type === "photo") {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: "absolute",
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        background: `url(${el.background}) center/cover no-repeat`,
                        borderRadius: el.borderRadius || undefined,
                      }}
                    />
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          .print-page {
            page-break-after: always;
            break-after: page;
            position: relative;
          }
          .print-wrapper {
            display: block !important;
          }
        }
      `}</style>

      {/* AI Slide-Over */}
      <AIPanelSlideOver
        open={showAI}
        onClose={() => setShowAI(false)}
        pages={pages}
        selectedText={
          currentPage.elements.find((el) => el.id === selectedId)?.text || ""
        }
        updateElement={updateElement}
      />
    </div>
  );
}
