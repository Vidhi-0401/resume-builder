// app/blank/page.tsx (or wherever your blank editor lives)
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

type ElemType = "text" | "rect" | "circle" | "line";

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
};

type Page = {
  id: string;
  elements: Elem[];
};

const genId = (prefix = "") => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

export default function BlankEditor() {
  // canvas state
  const [pages, setPages] = useState<Page[]>([{ id: genId("page-"), elements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  // saving / resumes list state
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

  // --- canvas helpers (unchanged) ---
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
    const onUp = () => {
      setDragState(null);
    };
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
        elements: copy[currentPageIndex].elements.filter((e) => e.id !== selectedId),
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

  // --- fetch saved resumes on mount ---
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

  // --- save (POST or PUT) ---
  const handleSave = async () => {
    setLoadingSave(true);
    try {
      const payload = {
        name: resumeName || "Untitled Resume",
        templateId: "blank",
        pages,
      };

      const method = editingResumeId ? "PUT" : "POST";
      const url = editingResumeId ? `/api/resume/${editingResumeId}` : "/api/resume";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      const saved = await res.json();

      // Update local list
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

  // --- load a resume into the canvas for editing ---
  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/resume/${id}`);
      if (!res.ok) throw new Error("Failed to load resume");
      const saved = await res.json();
      // set pages from saved resume, fall back to empty page if missing
      setPages(saved.pages && saved.pages.length ? saved.pages : [{ id: genId("page-"), elements: [] }]);
      setCurrentPageIndex(0);
      setResumeName(saved.name || "");
      setEditingResumeId(saved._id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load resume");
    }
  };

  // --- delete a resume ---
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved resume?")) return;
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setResumes((prev) => prev.filter((r) => r._id !== id));
      // if currently editing that resume - reset editor
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Create Your Own Resume — Blank Canvas</h2>
          <div className="space-x-2 flex items-center">
            <input
              placeholder="Resume name"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              className="px-3 py-2 rounded border mr-2"
            />
            <button onClick={addPage} className="px-3 py-2 bg-green-600 text-white rounded-md shadow">
              ➕ Add Page
            </button>
            <button onClick={handleSave} className="px-3 py-2 bg-emerald-600 text-white rounded-md shadow" disabled={loadingSave}>
              {loadingSave ? "Saving..." : editingResumeId ? "Update Save" : "Save Resume"}
            </button>
            <button onClick={handlePrint} className="px-3 py-2 bg-blue-600 text-white rounded-md shadow">
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tools */}
          <aside className="md:col-span-1 bg-gray-800 p-4 rounded shadow">
            <h3 className="font-semibold mb-2 text-white">Tools</h3>
            <div className="space-y-2">
              <button onClick={() => addElement("text")} className="w-full px-3 py-2 border rounded text-white border-gray-600">
                Add Text
              </button>
              <button onClick={() => addElement("rect")} className="w-full px-3 py-2 border rounded text-white border-gray-600">
                Add Rectangle
              </button>
              <button onClick={() => addElement("circle")} className="w-full px-3 py-2 border rounded text-white border-gray-600">
                Add Circle
              </button>
              <button onClick={() => addElement("line")} className="w-full px-3 py-2 border rounded text-white border-gray-600">
                Add Line
              </button>
            </div>

            {/* Selected element */}
            <div className="mt-6">
              <h4 className="font-semibold text-white">Selected</h4>
              {!selectedId ? (
                <div className="text-sm text-gray-300 mt-2">No element selected</div>
              ) : (
                <>
                  <div className="mt-2 text-sm text-white">Font family</div>
                  <select
                    className="w-full border rounded px-2 py-1 bg-gray-700 text-white"
                    onChange={(e) => updateElement((el) => ({ ...el, fontFamily: e.target.value }))}
                    value={currentPage.elements.find((el) => el.id === selectedId)?.fontFamily || "Arial, sans-serif"}
                  >
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Noto Sans', sans-serif">Noto Sans</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Georgia', serif">Georgia</option>
                  </select>

                  <div className="mt-2 text-sm text-white">Font size</div>
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 bg-gray-700 text-white"
                    onChange={(e) => updateElement((el) => ({ ...el, fontSize: Number(e.target.value) || 12 }))}
                    value={currentPage.elements.find((el) => el.id === selectedId)?.fontSize || 16}
                  />

                  <div className="mt-2 text-sm text-white">Text color</div>
                  <input
                    type="color"
                    className="w-full h-8 p-0"
                    onChange={(e) => updateElement((el) => ({ ...el, color: e.target.value }))}
                    value={currentPage.elements.find((el) => el.id === selectedId)?.color || "#111827"}
                  />

                  <div className="mt-2 text-sm text-white">Background</div>
                  <input
                    type="color"
                    className="w-full h-8 p-0"
                    onChange={(e) => updateElement((el) => ({ ...el, background: e.target.value }))}
                    value={currentPage.elements.find((el) => el.id === selectedId)?.background || "#00000000"}
                  />

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => removeSelected()} className="px-3 py-1 bg-red-500 text-white rounded">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* page buttons */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-white">Pages</h4>
              <div className="flex gap-2">
                {pages.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 rounded border ${i === currentPageIndex ? "bg-indigo-600 text-white" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved resumes list (small viewport) */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-white">Saved Resumes</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {resumes.length === 0 ? (
                  <div className="text-gray-300 text-sm">No saved resumes</div>
                ) : (
                  resumes.map((r) => (
                    <div key={r._id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                      <div className="text-sm text-white truncate w-36">{r.name}</div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(r._id)} className="px-2 py-1 bg-yellow-500 rounded text-white text-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(r._id)} className="px-2 py-1 bg-red-600 rounded text-white text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Canvas */}
          <main className="md:col-span-3 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="bg-white p-3 rounded shadow">
                  <div className="mb-2 text-sm text-gray-500">Canvas (drag items to reposition / resize)</div>

                  <div
                    className="mx-auto bg-white border"
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
                        return (
                          <div key={el.id} style={baseStyle} onMouseDown={(e) => onElementMouseDown(e, el)}>
                            <div
                              id={`txt-${el.id}`}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const txt = e.currentTarget.textContent || "";
                                setPages((prev) => {
                                  const copy = [...prev];
                                  copy[currentPageIndex] = {
                                    ...copy[currentPageIndex],
                                    elements: copy[currentPageIndex].elements.map((x) =>
                                      x.id === el.id ? { ...x, text: txt } : x
                                    ),
                                  };
                                  return copy;
                                });
                              }}
                              style={{
                                width: "100%",
                                height: "100%",
                                fontSize: el.fontSize,
                                fontFamily: el.fontFamily,
                                color: el.color,
                                background: el.background === "transparent" ? "transparent" : el.background,
                                padding: 6,
                                overflow: "hidden",
                              }}
                            >
                              {el.text}
                            </div>
                            {isSelected && <div style={resizeHandleStyle} onMouseDown={(e) => onResizeMouseDown(e, el)} />}
                          </div>
                        );
                      }

                      if (el.type === "rect" || el.type === "circle" || el.type === "line") {
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
                            {isSelected && <div style={resizeHandleStyle} onMouseDown={(e) => onResizeMouseDown(e, el)} />}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              </div>

              <div style={{ width: 240 }}>
                <div className="bg-white p-3 rounded shadow">
                  <h4 className="font-semibold">Preview / Page Tools</h4>
                  <div className="mt-3 text-sm text-gray-500">
                    Click an element to select. Double-click text to edit. Drag to move. Drag bottom-right corner to resize.
                  </div>

                  {/* Larger Saved Resumes area when enough space */}
                  <div className="mt-4">
                    <h5 className="font-semibold">Saved Resumes</h5>
                    <div className="mt-2 max-h-56 overflow-auto space-y-2">
                      {resumes.length === 0 ? (
                        <div className="text-sm text-gray-500">No saved resumes</div>
                      ) : (
                        resumes.map((r) => (
                          <div key={r._id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                            <div className="text-sm truncate w-40">{r.name}</div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEdit(r._id)} className="px-2 py-1 bg-yellow-500 rounded text-white text-sm">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(r._id)} className="px-2 py-1 bg-red-600 rounded text-white text-sm">
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
                  className={`px-3 py-1 text-sm rounded border ${i === currentPageIndex ? "bg-indigo-600 text-white" : "bg-white"}`}
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
                        background: el.background === "transparent" ? "transparent" : el.background,
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
    </div>
  );
}



// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";

// type ElemType = "text" | "rect" | "circle" | "line";

// type Elem = {
//   id: string;
//   type: ElemType;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   text?: string;
//   fontSize?: number;
//   fontFamily?: string;
//   color?: string;
//   background?: string;
// };

// type Page = {
//   id: string;
//   elements: Elem[];
// };

// const genId = (prefix = "") => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

// export default function BlankEditor() {
//   const [pages, setPages] = useState<Page[]>([{ id: genId("page-"), elements: [] }]);
//   const [currentPageIndex, setCurrentPageIndex] = useState(0);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [dragState, setDragState] = useState<{
//     id: string;
//     startX: number;
//     startY: number;
//     origX?: number;
//     origY?: number;
//     origWidth?: number;
//     origHeight?: number;
//     resizing?: boolean;
//   } | null>(null);

//   const printRef = useRef<HTMLDivElement | null>(null);

//   const handlePrint = useReactToPrint({
//     contentRef: printRef,
//     documentTitle: "My_Custom_Resume",
//   });

//   const updateElement = (update: (el: Elem) => Elem) => {
//     setPages((prev) => {
//       const copy = [...prev];
//       copy[currentPageIndex] = {
//         ...copy[currentPageIndex],
//         elements: copy[currentPageIndex].elements.map((el) =>
//           el.id === selectedId ? update(el) : el
//         ),
//       };
//       return copy;
//     });
//   };

//   const addElement = (type: ElemType) => {
//     const newEl: Elem = {
//       id: genId("el-"),
//       type,
//       x: 60,
//       y: 60,
//       width: 180,
//       height: type === "text" ? 40 : 100,
//       text: type === "text" ? "Double-click to edit" : undefined,
//       fontSize: 16,
//       fontFamily: "Arial, sans-serif",
//       color: "#111827", // dark text
//       background: type === "text" ? "transparent" : "#E5E7EB",
//     };
//     setPages((prev) => {
//       const copy = [...prev];
//       copy[currentPageIndex] = {
//         ...copy[currentPageIndex],
//         elements: [...copy[currentPageIndex].elements, newEl],
//       };
//       return copy;
//     });
//     setSelectedId(newEl.id);
//   };

//   const removeSelected = () => {
//     if (!selectedId) return;
//     setPages((prev) => {
//       const copy = [...prev];
//       copy[currentPageIndex] = {
//         ...copy[currentPageIndex],
//         elements: copy[currentPageIndex].elements.filter((e) => e.id !== selectedId),
//       };
//       return copy;
//     });
//     setSelectedId(null);
//   };

//   useEffect(() => {
//     const onMove = (e: MouseEvent) => {
//       if (!dragState) return;
//       const dx = e.clientX - dragState.startX;
//       const dy = e.clientY - dragState.startY;
//       setPages((prev) => {
//         const copy = [...prev];
//         copy[currentPageIndex] = {
//           ...copy[currentPageIndex],
//           elements: copy[currentPageIndex].elements.map((el) => {
//             if (el.id !== dragState.id) return el;
//             if (dragState.resizing) {
//               return {
//                 ...el,
//                 width: Math.max(20, (dragState.origWidth || el.width) + dx),
//                 height: Math.max(20, (dragState.origHeight || el.height) + dy),
//               };
//             } else {
//               return {
//                 ...el,
//                 x: (dragState.origX || el.x) + dx,
//                 y: (dragState.origY || el.y) + dy,
//               };
//             }
//           }),
//         };
//         return copy;
//       });
//     };
//     const onUp = () => {
//       setDragState(null);
//     };
//     window.addEventListener("mousemove", onMove);
//     window.addEventListener("mouseup", onUp);
//     return () => {
//       window.removeEventListener("mousemove", onMove);
//       window.removeEventListener("mouseup", onUp);
//     };
//   }, [dragState, currentPageIndex]);

//   const onElementMouseDown = (e: React.MouseEvent, el: Elem) => {
//     e.stopPropagation();
//     setSelectedId(el.id);
//     setDragState({
//       id: el.id,
//       startX: e.clientX,
//       startY: e.clientY,
//       origX: el.x,
//       origY: el.y,
//     });
//   };

//   const onResizeMouseDown = (e: React.MouseEvent, el: Elem) => {
//     e.stopPropagation();
//     setSelectedId(el.id);
//     setDragState({
//       id: el.id,
//       startX: e.clientX,
//       startY: e.clientY,
//       origWidth: el.width,
//       origHeight: el.height,
//       resizing: true,
//     });
//   };

//   const addPage = () => {
//     setPages((prev) => [...prev, { id: genId("page-"), elements: [] }]);
//     setCurrentPageIndex(pages.length);
//     setSelectedId(null);
//   };

//   const goToPage = (idx: number) => {
//     setCurrentPageIndex(idx);
//     setSelectedId(null);
//   };

//   const currentPage = pages[currentPageIndex];

//   return (
//     <div className="min-h-screen bg-gray-900 p-6">
//       <div className="max-w-full mx-auto">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-2xl font-bold text-white">Create Your Own Resume — Blank Canvas</h2>

//           <div className="space-x-2">
//             <button
//               onClick={addPage}
//               className="px-3 py-2 bg-green-600 text-white rounded-md shadow"
//             >
//               ➕ Add Page
//             </button>

//             <button
//               onClick={handlePrint}
//               className="px-3 py-2 bg-blue-600 text-white rounded-md shadow"
//             >
//               Download PDF
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <aside className="md:col-span-1 bg-gray-800 p-4 rounded shadow">
//             <h3 className="font-semibold mb-2 text-white">Tools</h3>
//             <div className="space-y-2">
//               <button
//                 onClick={() => addElement("text")}
//                 className="w-full px-3 py-2 border rounded text-white border-gray-600"
//               >
//                 Add Text
//               </button>
//               <button
//                 onClick={() => addElement("rect")}
//                 className="w-full px-3 py-2 border rounded text-white border-gray-600"
//               >
//                 Add Rectangle
//               </button>
//               <button
//                 onClick={() => addElement("circle")}
//                 className="w-full px-3 py-2 border rounded text-white border-gray-600"
//               >
//                 Add Circle
//               </button>
//               <button
//                 onClick={() => addElement("line")}
//                 className="w-full px-3 py-2 border rounded text-white border-gray-600"
//               >
//                 Add Line
//               </button>
//             </div>

//             {/* Selected element controls */}
//             <div className="mt-6">
//               <h4 className="font-semibold text-white">Selected</h4>
//               {!selectedId ? (
//                 <div className="text-sm text-gray-300 mt-2">No element selected</div>
//               ) : (
//                 <>
//                   <div className="mt-2 text-sm text-white">Font family</div>
//                   <select
//                     className="w-full border rounded px-2 py-1 bg-gray-700 text-white"
//                     onChange={(e) =>
//                       updateElement((el) => ({ ...el, fontFamily: e.target.value }))
//                     }
//                     value={
//                       currentPage.elements.find((el) => el.id === selectedId)?.fontFamily ||
//                       "Arial, sans-serif"
//                     }
//                   >
//                     <option value="Arial, sans-serif">Arial</option>
//                     <option value="'Noto Sans', sans-serif">Noto Sans</option>
//                     <option value="'Times New Roman', serif">Times New Roman</option>
//                     <option value="'Georgia', serif">Georgia</option>
//                   </select>

//                   <div className="mt-2 text-sm text-white">Font size</div>
//                   <input
//                     type="number"
//                     className="w-full border rounded px-2 py-1 bg-gray-700 text-white"
//                     onChange={(e) =>
//                       updateElement((el) => ({ ...el, fontSize: Number(e.target.value) || 12 }))
//                     }
//                     value={
//                       currentPage.elements.find((el) => el.id === selectedId)?.fontSize || 16
//                     }
//                   />

//                   <div className="mt-2 text-sm text-white">Text color</div>
//                   <input
//                     type="color"
//                     className="w-full h-8 p-0"
//                     onChange={(e) =>
//                       updateElement((el) => ({ ...el, color: e.target.value }))
//                     }
//                     value={currentPage.elements.find((el) => el.id === selectedId)?.color || "#111827"}
//                   />

//                   <div className="mt-2 text-sm text-white">Background</div>
//                   <input
//                     type="color"
//                     className="w-full h-8 p-0"
//                     onChange={(e) =>
//                       updateElement((el) => ({ ...el, background: e.target.value }))
//                     }
//                     value={currentPage.elements.find((el) => el.id === selectedId)?.background || "#00000000"}
//                   />

//                   <div className="flex gap-2 mt-3">
//                     <button
//                       onClick={() => removeSelected()}
//                       className="px-3 py-1 bg-red-500 text-white rounded"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* pages list */}
//             <div className="mt-6">
//               <h4 className="font-semibold mb-2 text-white">Pages</h4>
//               <div className="flex gap-2">
//                 {pages.map((p, i) => (
//                   <button
//                     key={p.id}
//                     onClick={() => goToPage(i)}
//                     className={`px-3 py-1 rounded border ${i === currentPageIndex ? "bg-indigo-600 text-white" : ""}`}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </aside>

//           {/* Canvas */}
//           <main className="md:col-span-3 flex flex-col gap-4">
//             <div className="flex gap-4">
//               <div className="flex-1">
//                 <div className="bg-white p-3 rounded shadow">
//                   <div className="mb-2 text-sm text-gray-500">Canvas (drag items to reposition / resize)</div>

//                   <div
//                     className="mx-auto bg-white border"
//                     style={{
//                       width: 794,
//                       height: 1123,
//                       position: "relative",
//                       overflow: "hidden",
//                     }}
//                     onMouseDown={() => setSelectedId(null)}
//                   >
//                     {currentPage.elements.map((el) => {
//                       const isSelected = selectedId === el.id;
//                       const baseStyle: React.CSSProperties = {
//                         position: "absolute",
//                         left: el.x,
//                         top: el.y,
//                         width: el.width,
//                         height: el.height,
//                         cursor: dragState?.resizing ? "nwse-resize" : "move",
//                         userSelect: "none",
//                         boxSizing: "border-box",
//                         border: isSelected ? "2px dashed #2563eb" : "none",
//                       };

//                       const resizeHandleStyle: React.CSSProperties = {
//                         width: 10,
//                         height: 10,
//                         background: "#2563eb",
//                         position: "absolute",
//                         right: -5,
//                         bottom: -5,
//                         cursor: "nwse-resize",
//                       };

//                       if (el.type === "text") {
//                         return (
//                           <div key={el.id} style={baseStyle} onMouseDown={(e) => onElementMouseDown(e, el)}>
//                             <div
//                               id={`txt-${el.id}`}
//                               contentEditable
//                               suppressContentEditableWarning
//                               onBlur={(e) => {
//                                 const txt = e.currentTarget.textContent || "";
//                                 setPages((prev) => {
//                                   const copy = [...prev];
//                                   copy[currentPageIndex] = {
//                                     ...copy[currentPageIndex],
//                                     elements: copy[currentPageIndex].elements.map((x) =>
//                                       x.id === el.id ? { ...x, text: txt } : x
//                                     ),
//                                   };
//                                   return copy;
//                                 });
//                               }}
//                               style={{
//                                 width: "100%",
//                                 height: "100%",
//                                 fontSize: el.fontSize,
//                                 fontFamily: el.fontFamily,
//                                 color: el.color,
//                                 background: el.background === "transparent" ? "transparent" : el.background,
//                                 padding: 6,
//                                 overflow: "hidden",
//                               }}
//                             >
//                               {el.text}
//                             </div>
//                             {isSelected && <div style={resizeHandleStyle} onMouseDown={(e) => onResizeMouseDown(e, el)} />}
//                           </div>
//                         );
//                       }

//                       if (el.type === "rect" || el.type === "circle" || el.type === "line") {
//                         return (
//                           <div
//                             key={el.id}
//                             style={{
//                               ...baseStyle,
//                               background: el.background,
//                               borderRadius: el.type === "circle" ? "50%" : undefined,
//                               height: el.type === "line" ? 4 : el.height,
//                             }}
//                             onMouseDown={(e) => onElementMouseDown(e, el)}
//                           >
//                             {isSelected && <div style={resizeHandleStyle} onMouseDown={(e) => onResizeMouseDown(e, el)} />}
//                           </div>
//                         );
//                       }

//                       return null;
//                     })}
//                   </div>
//                 </div>
//               </div>

//               <div style={{ width: 240 }}>
//                 <div className="bg-white p-3 rounded shadow">
//                   <h4 className="font-semibold">Preview / Page Tools</h4>
//                   <div className="mt-3 text-sm text-gray-500">
//                     Click an element to select. Double-click text to edit. Drag to move. Drag bottom-right corner to resize.
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               {pages.map((p, i) => (
//                 <button
//                   key={p.id}
//                   onClick={() => goToPage(i)}
//                   className={`px-3 py-1 text-sm rounded border ${i === currentPageIndex ? "bg-indigo-600 text-white" : "bg-white"}`}
//                 >
//                   Page {i + 1}
//                 </button>
//               ))}
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* Hidden print wrapper */}
//       <div style={{ display: "none" }}>
//         <div ref={printRef}>
//           {pages.map((p) => (
//             <div
//               key={p.id}
//               style={{
//                 width: 794,
//                 height: 1123,
//                 boxSizing: "border-box",
//                 padding: 20,
//                 background: "#fff",
//                 pageBreakAfter: "always",
//               }}
//             >
//               {p.elements.map((el) => {
//                 if (el.type === "text") {
//                   return (
//                     <div
//                       key={el.id}
//                       style={{
//                         position: "absolute",
//                         left: el.x,
//                         top: el.y,
//                         width: el.width,
//                         height: el.height,
//                         fontSize: el.fontSize,
//                         fontFamily: el.fontFamily,
//                         color: el.color,
//                         background: el.background === "transparent" ? "transparent" : el.background,
//                         padding: 6,
//                         boxSizing: "border-box",
//                       }}
//                     >
//                       {el.text}
//                     </div>
//                   );
//                 }
//                 if (el.type === "rect") {
//                   return (
//                     <div
//                       key={el.id}
//                       style={{
//                         position: "absolute",
//                         left: el.x,
//                         top: el.y,
//                         width: el.width,
//                         height: el.height,
//                         background: el.background,
//                       }}
//                     />
//                   );
//                 }
//                 if (el.type === "circle") {
//                   return (
//                     <div
//                       key={el.id}
//                       style={{
//                         position: "absolute",
//                         left: el.x,
//                         top: el.y,
//                         width: el.width,
//                         height: el.height,
//                         background: el.background,
//                         borderRadius: "50%",
//                       }}
//                     />
//                   );
//                 }
//                 if (el.type === "line") {
//                   return (
//                     <div
//                       key={el.id}
//                       style={{
//                         position: "absolute",
//                         left: el.x,
//                         top: el.y,
//                         width: el.width,
//                         height: 4,
//                         background: el.background ?? "#111",
//                       }}
//                     />
//                   );
//                 }
//                 return null;
//               })}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
