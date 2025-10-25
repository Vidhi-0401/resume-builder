// // components/ResumeOverlay.tsx
// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { Rnd } from "react-rnd";
// import { HexColorPicker } from "react-colorful";
// import { v4 as uuidv4 } from "uuid";
// import { DraggableEvent, DraggableData } from "react-draggable";


// /**
//  * ResumeOverlay - single-file drop-in
//  *
//  * Adjustments:
//  * - Toolbar moved above preview (negative top).
//  * - Shapes render with low z-index so resume content remains visible.
//  * - Toolbar z-index increased so it floats above everything.
//  * - Kept clones and export logic.
//  *
//  * Requires: react-rnd, react-colorful, uuid
//  */

// type ShapeType = "line" | "rectangle" | "square" | "circle";

// type Shape = {
//     id: string;
//     type: ShapeType;
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     rotate: number;
//     color: string;
//     border?: string;
// };

// type CloneItem = {
//     id: string;
//     html: string;
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     zIndex: number;
//     visible: boolean;
// };

// export default function ResumeOverlay({
//     targetRef,
// }: {
//     targetRef: React.RefObject<HTMLElement | null>;
// }) {
//     const overlayRootRef = useRef<HTMLDivElement | null>(null);
//     const [mounted, setMounted] = useState(false);

//     // shapes state
//     const [shapes, setShapes] = useState<Shape[]>([]);
//     const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

//     // clones of sections for dragging
//     const [clones, setClones] = useState<CloneItem[]>([]);
//     const [makeSectionsDraggable, setMakeSectionsDraggable] = useState(false);

//     // toolbar UI states
//     const [showShapeColorPicker, setShowShapeColorPicker] = useState(false);
//     const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
//     const [resumeBorderColor, setResumeBorderColor] = useState<string>("#ffffff");
//     const [selectedShapeRotate, setSelectedShapeRotate] = useState<number>(0);

//     // ensure overlay root exists inside targetRef
//     useEffect(() => {
//         const target = targetRef.current;
//         if (!target) return;

//         // create overlay container appended to preview container
//         const overlay = document.createElement("div");
//         overlay.style.position = "absolute";
//         overlay.style.top = "0";
//         overlay.style.left = "0";
//         overlay.style.width = "100%";
//         overlay.style.height = "100%";
//         overlay.style.pointerEvents = "none"; // default; children can enable pointer events
//         overlay.style.zIndex = "999"; // above preview
//         overlay.className = "resume-overlay-root";
//         overlayRootRef.current = overlay;

//         // ensure the target container has position: relative to anchor absolute child
//         const prevPosition = (target.style && target.style.position) || "";
//         if (!prevPosition || prevPosition === "static") {
//             // add a style attribute only if necessary
//             target.style.position = "relative";
//         }

//         target.appendChild(overlay);
//         setMounted(true);

//         return () => {
//             if (overlay && overlay.parentElement) {
//                 overlay.parentElement.removeChild(overlay);
//             }
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [targetRef.current]);

//     // helper to add a shape
//     const addShape = (type: ShapeType) => {
//         const defaultShape: Shape = {
//             id: uuidv4(),
//             type,
//             x: 40,
//             y: 40,
//             width: type === "line" ? 220 : 120,
//             height: type === "line" ? 6 : 80,
//             rotate: 0,
//             color: "#3168ff",
//             border: "transparent",
//         };
//         setShapes((s) => [...s, defaultShape]);
//         setSelectedShapeId(defaultShape.id);
//         setSelectedShapeRotate(0);
//     };

//     const updateShape = (id: string, patch: Partial<Shape>) => {
//         setShapes((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
//     };

//     const removeSelectedShape = () => {
//         if (!selectedShapeId) return;
//         setShapes((arr) => arr.filter((s) => s.id !== selectedShapeId));
//         setSelectedShapeId(null);
//     };

//     // create clones for sections (find headings and clone)
//     const buildClonesFromPreview = () => {
//         const target = targetRef.current;
//         if (!target) return;
//         const found: CloneItem[] = [];
//         // find elements that look like a section header + content
//         const headings = target.querySelectorAll("h1, h2, h3, [data-section], [data-section-id]");
//         const seen = new Set<HTMLElement>();
//         headings.forEach((h) => {
//             const el = h as HTMLElement;
//             let section = el.closest("div, section, article") as HTMLElement | null;
//             if (!section) section = el.parentElement;
//             if (!section) return;
//             if (seen.has(section)) return;
//             seen.add(section);

//             const rect = section.getBoundingClientRect();
//             const parentRect = target.getBoundingClientRect();
//             const relativeX = rect.left - parentRect.left;
//             const relativeY = rect.top - parentRect.top;

//             const html = section.innerHTML;

//             found.push({
//                 id: uuidv4(),
//                 html,
//                 x: Math.max(0, relativeX),
//                 y: Math.max(0, relativeY),
//                 width: Math.max(80, rect.width),
//                 height: Math.max(40, rect.height),
//                 zIndex: 40, // clones should appear above shapes
//                 visible: true,
//             });
//         });

//         // fallback if none found
//         if (found.length === 0) {
//             const candidates = Array.from(target.querySelectorAll("div")).filter((d) => {
//                 const hh = (d as HTMLElement).querySelectorAll("h2, h3, h1");
//                 return hh.length > 0;
//             });
//             candidates.slice(0, 10).forEach((section) => {
//                 const el = section as HTMLElement;
//                 const rect = el.getBoundingClientRect();
//                 const parentRect = target.getBoundingClientRect();
//                 const relativeX = rect.left - parentRect.left;
//                 const relativeY = rect.top - parentRect.top;
//                 found.push({
//                     id: uuidv4(),
//                     html: el.innerHTML,
//                     x: Math.max(0, relativeX),
//                     y: Math.max(0, relativeY),
//                     width: Math.max(80, rect.width),
//                     height: Math.max(40, rect.height),
//                     zIndex: 40,
//                     visible: true,
//                 });
//             });
//         }

//         setClones(found);
//     };

//     // toggle clones generation when user requests draggable sections
//     useEffect(() => {
//         if (makeSectionsDraggable) {
//             buildClonesFromPreview();
//         } else {
//             setClones([]);
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [makeSectionsDraggable, targetRef.current]);

//     // selected shape rotate syncing
//     useEffect(() => {
//         if (!selectedShapeId) {
//             setSelectedShapeRotate(0);
//             return;
//         }
//         const s = shapes.find((x) => x.id === selectedShapeId);
//         if (s) setSelectedShapeRotate(s.rotate);
//     }, [selectedShapeId, shapes]);

//     if (!mounted || !overlayRootRef.current) return null;

//     // ------- STYLES / CONSTANTS -------
//     const TOOLBAR_TOP = -56; // negative to lift toolbar above preview top (in px)
//     const TOOLBAR_Z = 1200; // ensure toolbar is on top
//     const SHAPE_BASE_Z = 8; // shapes render behind content (low z)
//     const SHAPE_SELECTED_Z = 12; // still low so content remains visible

//     // main overlay UI (portal)
//     const overlayUI = (
//         <div
//             style={{
//                 position: "absolute",
//                 inset: 0,
//                 pointerEvents: "none",
//             }}
//             onMouseDown={() => {
//                 // clicking overlay background clears selection
//                 setSelectedShapeId(null);
//             }}
//         >
//             {/* Toolbar area (moved above the preview) */}
//             <div
//                 style={{
//                     /* === CHANGED: fixed full-width toolbar positioned below global header === */
//                     position: "fixed",
//                     top: 70, // adjust this value if your header has different height
//                     left: 0,
//                     transform: "none",
//                     height: "auto",
//                     display: "flex",
//                     alignItems: "center",
//                     flexWrap: "nowrap", // keep horizontal in single line
//                     justifyContent: "flex-start", // start from left
//                     gap: 10,
//                     pointerEvents: "auto",
//                     zIndex: TOOLBAR_Z,
//                     background: "rgba(255,255,255,0.08)",
//                     padding: "10px 20px",
//                     borderRadius: 12,
//                     backdropFilter: "blur(6px)",
//                     boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
//                     border: "1px solid rgba(255,255,255,0.1)",
//                     width: "100%", // full width horizontally
//                     maxWidth: "100%",
//                     overflowX: "auto", // prevent clipping
//                     whiteSpace: "nowrap",
//                     boxSizing: "border-box",
//                 }}
//             >


//                 {/* Add shape buttons */}
//                 <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                     <button
//                         onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                             e.stopPropagation();
//                             addShape("line");
//                         }}
//                         className="px-3 py-1 rounded"
//                         style={{ pointerEvents: "auto" }}
//                         title="Add line"
//                     >
//                         ➖ Line
//                     </button>
//                     <button
//                         onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                             e.stopPropagation();
//                             addShape("rectangle");
//                         }}
//                         className="px-3 py-1 rounded"
//                         style={{ pointerEvents: "auto" }}
//                         title="Add rectangle"
//                     >
//                         ▭ Rectangle
//                     </button>
//                     <button
//                         onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                             e.stopPropagation();
//                             addShape("square");
//                         }}
//                         style={{ pointerEvents: "auto" }}
//                         title="Add square"
//                         className="px-3 py-1 rounded"
//                     >
//                         ◻ Square
//                     </button>
//                     <button
//                         onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                             e.stopPropagation();
//                             addShape("circle");
//                         }}
//                         style={{ pointerEvents: "auto" }}
//                         title="Add circle"
//                         className="px-3 py-1 rounded"
//                     >
//                         ◯ Circle
//                     </button>
//                 </div>

//                 {/* Selected shape controls */}
//                 <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 8 }}>
//                     <button
//                         onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                             e.stopPropagation();
//                             setShowShapeColorPicker((v) => !v);
//                         }}
//                         className="px-3 py-1 rounded"
//                         style={{ pointerEvents: "auto" }}
//                         title="Color picker"
//                     >
//                         🎨 Shape color
//                     </button>

//                     <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
//                         {showShapeColorPicker && selectedShapeId && (
//                             <div
//                                 style={{
//                                     position: "absolute",
//                                     top: 52,
//                                     left: 0,
//                                     pointerEvents: "auto",
//                                     zIndex: TOOLBAR_Z + 10,
//                                     background: "white",
//                                     padding: 8,
//                                     borderRadius: 8,
//                                 }}
//                                 onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
//                             >
//                                 <HexColorPicker
//                                     color={
//                                         shapes.find((s) => s.id === selectedShapeId)?.color || "#3168ff"
//                                     }
//                                     onChange={(c: string) => {
//                                         updateShape(selectedShapeId, { color: c });
//                                     }}
//                                 />
//                                 <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
//                                     <button
//                                         onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                                             e.stopPropagation();
//                                             setShowShapeColorPicker(false);
//                                         }}
//                                         style={{ pointerEvents: "auto" }}
//                                     >
//                                         Close
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     <button
//                         onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                             e.stopPropagation();
//                             setShowBorderColorPicker((v) => !v);
//                         }}
//                         style={{ pointerEvents: "auto" }}
//                         title="Resume border color"
//                         className="px-3 py-1 rounded"
//                     >
//                         🖼️ Border color
//                     </button>

//                     {showBorderColorPicker && (
//                         <div
//                             style={{
//                                 position: "absolute",
//                                 top: 52,
//                                 left: 200,
//                                 pointerEvents: "auto",
//                                 zIndex: TOOLBAR_Z + 10,
//                                 background: "white",
//                                 padding: 8,
//                                 borderRadius: 8,
//                             }}
//                             onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
//                         >
//                             <HexColorPicker color={resumeBorderColor} onChange={setResumeBorderColor} />
//                             <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between" }}>
//                                 <button
//                                     onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                                         e.stopPropagation();
//                                         setShowBorderColorPicker(false);
//                                     }}
//                                 >
//                                     Close
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Rotation slider for selected shape */}
//                     <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//                         <label style={{ fontSize: 12 }}>Rotate</label>
//                         <input
//                             type="range"
//                             min={0}
//                             max={360}
//                             value={selectedShapeRotate}
//                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                                 const val = Number(e.target.value);
//                                 setSelectedShapeRotate(val);
//                                 if (selectedShapeId) updateShape(selectedShapeId, { rotate: val });
//                             }}
//                             style={{ pointerEvents: "auto" }}
//                         />
//                     </div>

//                     <button
//                         onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
//                             e.stopPropagation();
//                             removeSelectedShape();
//                         }}
//                         style={{ pointerEvents: "auto" }}
//                         title="Remove selected shape"
//                     >
//                         🗑 Delete Shape
//                     </button>
//                 </div>

//                 {/* Spacer */}
//                 <div style={{ flex: 1 }} />

//                 {/* Section draggable toggle */}
//                 <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                     <button
//                         onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
//                             ev.stopPropagation();
//                             setMakeSectionsDraggable((v) => !v);
//                         }}
//                         style={{ pointerEvents: "auto" }}
//                         className="px-3 py-1 rounded"
//                         title="Toggle draggable sections"
//                     >
//                         {makeSectionsDraggable ? "🔒 Sections: ON" : "🔓 Make Sections Draggable"}
//                     </button>

//                     <button
//                         onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
//                             ev.stopPropagation();
//                             const payload = { shapes, clones, border: resumeBorderColor };
//                             const blob = new Blob([JSON.stringify(payload, null, 2)], {
//                                 type: "application/json",
//                             });
//                             const url = URL.createObjectURL(blob);
//                             const a = document.createElement("a");
//                             a.href = url;
//                             a.download = "resume-overlay-state.json";
//                             a.click();
//                             URL.revokeObjectURL(url);
//                         }}
//                         style={{ pointerEvents: "auto" }}
//                         className="px-3 py-1 rounded"
//                         title="Export overlay state"
//                     >
//                         ⤓ Export
//                     </button>
//                 </div>
//             </div>

//             {/* Edge border color applied to preview by injecting a small inner border box */}
//             <div
//                 style={{
//                     position: "absolute",
//                     inset: 6,
//                     border: `6px solid ${resumeBorderColor}`,
//                     pointerEvents: "none",
//                     zIndex: 200, // above shapes but below toolbar
//                     borderRadius: 6,
//                 }}
//             />

//             {/* Renders shapes and clones inside overlay; shapes are interactive so pointerEvents must be auto */}
//             <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 }}>
//                 {/* Shapes */}
//                 {shapes.map((shape) => {
//                     const selected = selectedShapeId === shape.id;
//                     // special rendering for line vs shapes
//                     const inner =
//                         shape.type === "line" ? (
//                             <div
//                                 style={{
//                                     width: "100%",
//                                     height: Math.max(2, Math.round(shape.height)),
//                                     background: shape.color,
//                                 }}
//                             />
//                         ) : (
//                             <div
//                                 style={{
//                                     width: "100%",
//                                     height: "100%",
//                                     background: shape.color,
//                                     border: shape.border ? `2px solid ${shape.border}` : undefined,
//                                     borderRadius: shape.type === "circle" ? "50%" : 6,
//                                 }}
//                             />
//                         );

//                     return (
//                         <Rnd
//                             key={shape.id}
//                             size={{ width: shape.width, height: shape.height }}
//                             position={{ x: shape.x, y: shape.y }}
//                             bounds="parent"
//                             onDragStart={(e: DraggableEvent, _data: DraggableData) => {
//                                 // prevent underlying clicks
//                                 e.stopPropagation();
//                             }}
//                             onDragStop={(_e: DraggableEvent, d: DraggableData) =>
//                                 updateShape(shape.id, { x: d.x, y: d.y })
//                             }
//                             onResizeStop={(
//                                 _e: MouseEvent | TouchEvent, // ✅ accept both
//                                 _dir: any,
//                                 ref: HTMLElement,
//                                 _delta: any,
//                                 pos: { x: number; y: number }
//                             ) => {
//                                 updateShape(shape.id, {
//                                     width: Math.max(6, ref.offsetWidth),
//                                     height: Math.max(6, ref.offsetHeight),
//                                     x: pos.x,
//                                     y: pos.y,
//                                 });
//                             }}

//                             style={{
//                                 transform: `rotate(${shape.rotate}deg)`,
//                                 transformOrigin: "center center",
//                                 zIndex: selected ? SHAPE_SELECTED_Z : SHAPE_BASE_Z, // keep shapes behind content
//                                 pointerEvents: "auto",
//                                 boxShadow: selected ? "0 6px 18px rgba(0,0,0,0.18)" : undefined,
//                                 border: selected ? "1px dashed rgba(0,0,0,0.12)" : "none",
//                                 background: "transparent",
//                                 opacity: 0.95,
//                             }}
//                             enableResizing={{
//                                 top: true,
//                                 right: true,
//                                 bottom: true,
//                                 left: true,
//                                 topRight: true,
//                                 bottomRight: true,
//                                 bottomLeft: true,
//                                 topLeft: true,
//                             }}
//                             onClick={(e: React.MouseEvent<HTMLDivElement>) => {
//                                 e.stopPropagation();
//                                 setSelectedShapeId(shape.id);
//                             }}
//                         >
//                             <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>{inner}</div>
//                         </Rnd>
//                     );
//                 })}

//                 {/* Cloned draggable visual sections */}
//                 {clones.map((c, i) => (
//                     <Rnd
//                         key={c.id}
//                         size={{ width: c.width, height: c.height }}
//                         position={{ x: c.x, y: c.y }}
//                         onDragStop={(_e: DraggableEvent, d: DraggableData) =>
//                             setClones((arr) => arr.map((it) => (it.id === c.id ? { ...it, x: d.x, y: d.y } : it)))
//                         }
//                         onResizeStop={(
//                             _e: MouseEvent | TouchEvent, // ✅ accept both
//                             _dir: any,
//                             ref: HTMLElement,
//                             _delta: any,
//                             pos: { x: number; y: number }
//                         ) =>
//                             setClones((arr) =>
//                                 arr.map((it) =>
//                                     it.id === c.id
//                                         ? {
//                                             ...it,
//                                             width: Math.max(20, ref.offsetWidth),
//                                             height: Math.max(20, ref.offsetHeight),
//                                             x: pos.x,
//                                             y: pos.y,
//                                         }
//                                         : it
//                                 )
//                             )
//                         }

//                         bounds="parent"
//                         style={{
//                             zIndex: c.zIndex,
//                             pointerEvents: "auto",
//                             boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
//                             borderRadius: 6,
//                             overflow: "hidden",
//                             background: "white",
//                         }}
//                         onClick={(e: React.MouseEvent<HTMLDivElement>) => {
//                             e.stopPropagation();
//                         }}
//                     >
//                         <div
//                             style={{
//                                 width: "100%",
//                                 height: "100%",
//                                 overflow: "auto",
//                                 padding: 10,
//                                 background: "white",
//                                 color: "black",
//                             }}
//                             // clone of the section markup (dangerous but purely visual)
//                             dangerouslySetInnerHTML={{ __html: c.html }}
//                         />
//                     </Rnd>
//                 ))}
//             </div>
//         </div>
//     );

//     return createPortal(overlayUI, overlayRootRef.current);
// }
// components/ResumeOverlay.tsx
// components/ResumeOverlay.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";
import { HexColorPicker } from "react-colorful";
import { v4 as uuidv4 } from "uuid";
import { DraggableEvent, DraggableData } from "react-draggable";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench  } from "lucide-react";

/**
 * ResumeOverlay.tsx
 *
 * - Renders two DOM roots inside the provided preview container (targetRef):
 *   1) bgRootRef -> visible faint shapes & preview-only border (inserted BEFORE resume content so resume sits above them)
 *   2) fgRootRef -> interactive RnD overlays + toggle button (appended so it receives clicks)
 * - Sidebar rendered into document.body (dark glass)
 * - Shapes are rendered faintly in the background root (watermark effect) but are fully draggable/resizable using
 *   interactive transparent RnD boxes in the foreground root.
 *
 * Usage: <ResumeOverlay targetRef={previewElementRef} />
 */

type ShapeType = "line" | "rectangle" | "square" | "circle";

type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  color: string;
  border?: string | null;
  zIndex: number;

  // 🩵 Added these optional fields to match usage below:
  fillColor?: string;
  borderColor?: string;
  borderEnabled?: boolean;
};


type CloneItem = {
    id: string;
    html: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    visible: boolean;
    originalEl?: HTMLElement | null;
};

export default function ResumeOverlay({
    targetRef,
}: {
    targetRef: React.RefObject<HTMLElement | null>;
}) {
    const bgRootRef = useRef<HTMLDivElement | null>(null);
    const fgRootRef = useRef<HTMLDivElement | null>(null);
    const [mounted, setMounted] = useState(false);

    // --- states (features preserved) ---
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
    const [clones, setClones] = useState<CloneItem[]>([]);
    const [makeSectionsDraggable, setMakeSectionsDraggable] = useState(false);

    // UI
    const [showShapeColorPicker, setShowShapeColorPicker] = useState(false);
    const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
    const [resumeBorderColor, setResumeBorderColor] = useState<string>("#ffffff");
    const [selectedShapeRotate, setSelectedShapeRotate] = useState<number>(0);
    const [showOverlaySidebar, setShowOverlaySidebar] = useState<boolean>(false);
    const [noBorder, setNoBorder] = useState<boolean>(false);

    // create two DOM roots inside targetRef:
    // - bg (prepended) => visually behind resume content
    // - fg (appended)  => handles interactions (transparent RnDs etc.)
    useEffect(() => {
        const target = targetRef?.current;
        if (!target) return;

        // ensure preview container is positioned so absolute children align
        const prevPosition = getComputedStyle(target).position;
        if (!prevPosition || prevPosition === "static") {
            target.style.position = "relative";
        }

        const bg = document.createElement("div");
        bg.className = "resume-overlay-bg-root";
        Object.assign(bg.style, {
            position: "absolute",
            inset: "0px",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: "2", // low; resume content that follows in DOM will be above
        });

        const fg = document.createElement("div");
        fg.className = "resume-overlay-fg-root";
        Object.assign(fg.style, {
            position: "absolute",
            inset: "0px",
            width: "100%",
            height: "100%",
            pointerEvents: "none", // children will enable pointer events
            zIndex: "999", // above resume to handle interactions
        });

        // insert bg before first child so it's under resume content
        if (target.firstChild) target.insertBefore(bg, target.firstChild);
        else target.appendChild(bg);

        // append interactive foreground
        target.appendChild(fg);

        bgRootRef.current = bg;
        fgRootRef.current = fg;
        setMounted(true);

        return () => {
            try {
                bg.parentElement?.removeChild(bg);
            } catch (e) { }
            try {
                fg.parentElement?.removeChild(fg);
            } catch (e) { }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetRef]);

    // ---------- helpers ----------
    const getNextZ = () => (shapes.length === 0 ? 1 : Math.max(...shapes.map((s) => s.zIndex)) + 1);
    const getMinZ = () => (shapes.length === 0 ? 0 : Math.min(...shapes.map((s) => s.zIndex)));

    const addShape = (type: ShapeType) => {
        const target = targetRef.current;
        const parentRect = target?.getBoundingClientRect();
        // spawn near top-left of preview area (not header/logo). if we have rect, spawn a bit offset from left/top.
        const spawnX = parentRect ? Math.max(12, parentRect.width * 0.06) : 40;
        const spawnY = parentRect ? Math.max(12, parentRect.height * 0.04) : 40;

        const defaultShape: Shape = {
            id: uuidv4(),
            type,
            x: spawnX,
            y: spawnY,
            width: type === "line" ? 220 : 120,
            height: type === "line" ? 6 : 80,
            rotate: 0,
            color: "rgba(49,104,255,0.28)", // watermark-ish default
            border: null,
            zIndex: getNextZ(),
        };
        setShapes((s) => [...s, defaultShape]);
        setSelectedShapeId(defaultShape.id);
        setSelectedShapeRotate(0);
    };

    const updateShape = (id: string, patch: Partial<Shape>) =>
        setShapes((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));

    const removeSelectedShape = () => {
        if (!selectedShapeId) return;
        setShapes((arr) => arr.filter((s) => s.id !== selectedShapeId));
        setSelectedShapeId(null);
    };

    const bringToFront = (id: string) => {
        updateShape(id, { zIndex: getNextZ() });
    };
    const sendToBack = (id: string) => {
        updateShape(id, { zIndex: getMinZ() - 1 });
    };

    // ---------- clones (draggable resume sections) ----------
    const buildClonesFromPreview = () => {
        const target = targetRef?.current;
        if (!target) return;
        const found: CloneItem[] = [];
        const headings = target.querySelectorAll("h1, h2, h3, [data-section], [data-section-id]");
        const seen = new Set<HTMLElement>();

        headings.forEach((h) => {
            const el = h as HTMLElement;
            let section = el.closest("div, section, article") as HTMLElement | null;
            if (!section) section = el.parentElement as HTMLElement | null;
            if (!section || seen.has(section)) return;
            seen.add(section);

            const rect = section.getBoundingClientRect();
            const parentRect = target.getBoundingClientRect();
            const relativeX = Math.max(0, rect.left - parentRect.left);
            const relativeY = Math.max(0, rect.top - parentRect.top);

            found.push({
                id: uuidv4(),
                html: section.innerHTML,
                x: relativeX,
                y: relativeY,
                width: Math.max(80, rect.width),
                height: Math.max(40, rect.height),
                zIndex: 40,
                visible: true,
                originalEl: section,
            });
        });

        // fallback: take top-level divs with headings
        if (found.length === 0) {
            const candidates = Array.from(target.querySelectorAll("div")).filter((d) => {
                const hh = (d as HTMLElement).querySelectorAll("h2,h3,h1");
                return hh.length > 0;
            });
            candidates.slice(0, 10).forEach((section) => {
                const el = section as HTMLElement;
                const rect = el.getBoundingClientRect();
                const parentRect = target.getBoundingClientRect();
                found.push({
                    id: uuidv4(),
                    html: el.innerHTML,
                    x: Math.max(0, rect.left - parentRect.left),
                    y: Math.max(0, rect.top - parentRect.top),
                    width: Math.max(80, rect.width),
                    height: Math.max(40, rect.height),
                    zIndex: 40,
                    visible: true,
                    originalEl: el,
                });
            });
        }

        setClones(found);
    };

    useEffect(() => {
        if (makeSectionsDraggable) buildClonesFromPreview();
        else {
            clones.forEach((c) => {
                if (c.originalEl) c.originalEl.style.visibility = "";
            });
            setClones([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [makeSectionsDraggable]);

    // sync rotate slider with selected shape
    useEffect(() => {
        if (!selectedShapeId) {
            setSelectedShapeRotate(0);
            return;
        }
        const s = shapes.find((x) => x.id === selectedShapeId);
        if (s) setSelectedShapeRotate(s.rotate);
    }, [selectedShapeId, shapes]);

    if (!mounted || !bgRootRef.current || !fgRootRef.current) return null;

    // ---------- Sidebar portal ----------
    const sidebarPortal = (
        <AnimatePresence>
            {showOverlaySidebar && (
                <motion.div
                    initial={{ x: 420, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 420, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 90, damping: 16 }}
                    style={{ pointerEvents: "auto" }}
                >
                    <div
                        role="dialog"
                        aria-label="Overlay tools"
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            height: "100vh",
                            width: 360,
                            zIndex: 40000,
                            padding: 20,
                            boxSizing: "border-box",
                            overflowY: "auto",
                            borderLeft: "1px solid rgba(255,255,255,0.04)",
                            background: "linear-gradient(180deg, rgba(8,10,18,0.96), rgba(6,8,14,0.88))",
                            backdropFilter: "blur(14px) saturate(1.05)",
                            color: "#fff",
                            boxShadow: "-24px 0 60px rgba(0,0,0,0.6)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <h3 style={{ margin: 0, fontSize: 18 }}>Overlay Tools</h3>
                            <button
                                onClick={() => setShowOverlaySidebar(false)}
                                aria-label="Close overlay"
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "white",
                                    fontSize: 20,
                                    cursor: "pointer",
                                }}
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Add shapes */}
                        <section style={{ marginTop: 20 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>Add Shapes</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); addShape("line"); }} style={glassBtnStyle}>line</button>
                                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); addShape("rectangle"); }} style={glassBtnStyle}>rectangle</button>
                                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); addShape("square"); }} style={glassBtnStyle}>square</button>
                                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); addShape("circle"); }} style={glassBtnStyle}>circle</button>
                            </div>
                        </section>

                        {/* Selected controls */}
                        <section style={{ marginTop: 18 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>Selected Shape Controls</div>

                            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setShowShapeColorPicker((v) => !v); }} style={{ ...glassBtnStyle, width: "100%" }}>
                                🎨 Shape color
                            </button>
                            {showShapeColorPicker && selectedShapeId && (
                                <div style={{ marginTop: 10, padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                                    <HexColorPicker
                                        color={shapes.find((s) => s.id === selectedShapeId)?.color || "rgba(49,104,255,0.3)"}
                                        onChange={(c: string) => {
                                            // convert hex to rgba with opacity if needed
                                            const color = c.startsWith("#") ? hexToRgba(c, 0.28) : c;
                                            updateShape(selectedShapeId, { color });
                                        }}
                                    />
                                    <div style={{ height: 8 }} />
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); if (selectedShapeId) bringToFront(selectedShapeId); }} style={{ ...glassBtnStyle, flex: 1 }}>Bring to front</button>
                                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); if (selectedShapeId) sendToBack(selectedShapeId); }} style={{ ...glassBtnStyle, flex: 1 }}>Send to back</button>
                                    </div>
                                </div>
                            )}

                            <div style={{ height: 10 }} />

                            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setShowBorderColorPicker((v) => !v); }} style={{ ...glassBtnStyle, width: "100%" }}>
                                🖼️ Border color
                            </button>
                            {showBorderColorPicker && (
                                <div style={{ marginTop: 10, padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                                    <HexColorPicker color={resumeBorderColor} onChange={(c: string) => setResumeBorderColor(c)} />
                                    <div style={{ height: 8 }} />
                                    <button onClick={() => setNoBorder((v) => !v)} style={{ ...glassBtnStyle, width: "100%", marginTop: 6 }}>
                                        {noBorder ? "🚫 Hide Border" : "✅ Show Border"}
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Rotation / delete */}
                        <section style={{ marginTop: 18 }}>
                            <label style={{ display: "block", marginBottom: 8 }}>Rotate</label>
                            <input
                                type="range"
                                min={0}
                                max={360}
                                value={selectedShapeRotate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const val = Number(e.target.value);
                                    setSelectedShapeRotate(val);
                                    if (selectedShapeId) updateShape(selectedShapeId, { rotate: val });
                                }}
                                style={{ width: "100%" }}
                            />
                            <div style={{ height: 10 }} />
                            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); removeSelectedShape(); }} style={{ ...glassBtnStyle, width: "100%" }}>
                                🗑 Delete Selected
                            </button>
                        </section>

                        <section style={{ marginTop: 18 }}>
                            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setMakeSectionsDraggable((v) => !v); }} style={{ ...glassBtnStyle, width: "100%" }}>
                                {makeSectionsDraggable ? "🔒 Sections: ON" : "🔓 Make Sections Draggable"}
                            </button>
                        </section>

                        <div style={{ height: 36 }} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // ---------- Background shapes (visual watermark) ----------
    // Render sorted by zIndex (lowest -> highest). These are inserted inside the preview and are printed when printing the preview.
    const bgShapes = (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* border around preview ONLY (not whole page) */}
            {!noBorder && (
                <div
                    style={{
                        position: "absolute",
                        inset: 6,
                        border: `6px solid ${resumeBorderColor}`,
                        pointerEvents: "none",
                        zIndex: 3,
                        borderRadius: 8,
                        boxSizing: "border-box",
                    }}
                />
            )}

            {shapes
                .slice()
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((shape) => {
                    const inner =
                        shape.type === "line" ? (
                            <div style={{ width: "100%", height: shape.height, background: shape.color }} />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    background: shape.color,
                                    border: shape.border ? `2px solid ${shape.border}` : undefined,
                                    borderRadius: shape.type === "circle" ? "50%" : 8,
                                }}
                            />
                        );

                    return (
                        <div
                            key={`bg-${shape.id}`}
                            style={{
                                position: "absolute",
                                left: shape.x,
                                top: shape.y,
                                width: shape.width,
                                height: shape.height,
                                transform: `rotate(${shape.rotate}deg)`,
                                transformOrigin: "center",
                                pointerEvents: "none",
                                zIndex: shape.zIndex,
                                overflow: "hidden",
                                opacity: 1, // color should include alpha for watermark; we keep DOM-level opacity 1 for correct printing
                            }}
                        >
                            {inner}
                        </div>
                    );
                })}
        </div>
    );

    // ---------- Foreground interactive layer ----------
    // Transparent RnD boxes that let you drag/resize shapes; they update the state which re-renders background shapes.
    const fgInteractive = (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "auto", zIndex: 1000 }}>
                {shapes
                    .slice()
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((shape) => {
                        const isSelected = selectedShapeId === shape.id;
                        return (
                            <Rnd
                                key={`fg-${shape.id}`}
                                size={{ width: shape.width, height: shape.height }}
                                position={{ x: shape.x, y: shape.y }}
                                bounds="parent"
                                onDragStart={(e: DraggableEvent, d: DraggableData) => {
                                    // prevent underlying interactions
                                    try {
                                        (e as any).stopPropagation?.();
                                    } catch { }
                                    setSelectedShapeId(shape.id);
                                }}
                                onDragStop={(_e: DraggableEvent, d: DraggableData) => {
                                    updateShape(shape.id, { x: Math.max(0, d.x), y: Math.max(0, d.y) });
                                }}
                                onResizeStop={(_e: MouseEvent | TouchEvent, _dir, ref, _delta, pos) => {
                                    updateShape(shape.id, {
                                        width: Math.max(6, ref.offsetWidth),
                                        height: Math.max(6, ref.offsetHeight),
                                        x: Math.max(0, pos.x),
                                        y: Math.max(0, pos.y),
                                    });
                                }}
                                enableResizing={{
                                    top: true,
                                    right: true,
                                    bottom: true,
                                    left: true,
                                    topRight: true,
                                    bottomRight: true,
                                    bottomLeft: true,
                                    topLeft: true,
                                }}
                                style={{
                                    transform: `rotate(${shape.rotate}deg)`,
                                    transformOrigin: "center",
                                    zIndex: isSelected ? 1100 : 1000,
                                    pointerEvents: "auto",
                                    background: "transparent",
                                    border: isSelected ? "1px dashed rgba(255,255,255,0.85)" : "none",
                                    boxSizing: "border-box",
                                }}
                                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                    e.stopPropagation();
                                    setSelectedShapeId(shape.id);
                                }}
                            >
                                {/* transparent inner */}
                                <div style={{ width: "100%", height: "100%", pointerEvents: "none" }} />
                            </Rnd>
                        );
                    })}
            </div>

            {/* clones: draggable resume sections */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "auto", zIndex: 1500 }}>
                {/* 🟦 Background Shapes (Behind Resume but Draggable + Faintly Visible) */}
                {shapes.map((shape) => (
                    <Rnd
                        key={`shape-${shape.id}`}
                        size={{ width: shape.width, height: shape.height }}
                        position={{ x: shape.x, y: shape.y }}
                        bounds="parent"
                        onDragStart={(e: DraggableEvent, _d: DraggableData) => {
                            e.stopPropagation?.();
                            setSelectedShapeId(shape.id);
                        }}
                        onDragStop={(_e: DraggableEvent, d: DraggableData) => {
                            updateShape(shape.id, { x: d.x, y: d.y });
                        }}
                        onResize={(e: MouseEvent | TouchEvent, _dir, ref, _delta, pos) => {
                            updateShape(shape.id, {
                                width: Math.max(20, ref.offsetWidth),
                                height: Math.max(20, ref.offsetHeight),
                                x: Math.max(0, pos.x),
                                y: Math.max(0, pos.y),
                            });
                        }}
                        enableResizing={{
                            top: true,
                            right: true,
                            bottom: true,
                            left: true,
                            topRight: true,
                            bottomRight: true,
                            bottomLeft: true,
                            topLeft: true,
                        }}
                        style={{
                            position: "absolute",
                            zIndex: 1, // 👈 behind resume content
                            pointerEvents: "auto",
                            opacity: 0.18, // 👈 faint (watermark look)
                            mixBlendMode: "multiply", // 👈 blend nicely with resume
                            cursor: "move",
                        }}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.stopPropagation();
                            setSelectedShapeId(shape.id);
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundColor: shape.fillColor || "rgba(0,0,255,0.3)",
                                border: shape.borderEnabled ? `2px solid ${shape.borderColor || "#000"}` : "none",
                                borderRadius: shape.type === "circle" ? "50%" : "4px",
                                pointerEvents: "none",
                            }}
                        />
                    </Rnd>
                ))}

            </div>

            {/* Floating AI button (clickable) */}
            <div style={{ position: "fixed", bottom: 22, right: 22, zIndex: 45000, pointerEvents: "auto" }}>
                <motion.button
                    onClick={() => setShowOverlaySidebar((v) => !v)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 16px",
                        borderRadius: 999,
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        background: "linear-gradient(90deg, rgba(124,58,237,0.95), rgba(59,130,246,0.95))",
                        boxShadow: "0 12px 30px rgba(99,102,241,0.28)",
                        fontWeight: 700,
                    }}
                    aria-label="Toggle overlay tools"
                    title="Toggle overlay tools"
                >
                    <Wrench  style={{ width: 18, height: 18 }} />
                    <span style={{ whiteSpace: "nowrap" }}>{showOverlaySidebar ? "Close Tools" : "Tools"}</span>
                </motion.button>
            </div>
        </div>
    );

    // Render both portals into target children + sidebar into body.
    return (
        <>
            {createPortal(bgShapes, bgRootRef.current)}
            {createPortal(fgInteractive, fgRootRef.current)}
            {createPortal(sidebarPortal, document.body)}
        </>
    );
}

// small shared button style for sidebar
const glassBtnStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
};

// helper to convert hex to rgba with opacity
function hexToRgba(hex: string, alpha = 1) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

