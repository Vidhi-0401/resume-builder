"use client";

// npm i react-to-print marked

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReactToPrint } from "react-to-print";
import { marked } from "marked";

/*******************************
 * Types
 *******************************/
type ElemType =
  | "text"
  | "rect"
  | "circle"
  | "line"
  | "photo"
  | "icon"
  | "tag";

type Align = "left" | "center" | "right";

type Elem = {
  id: string;
  type: ElemType;
  x: number;
  y: number;
  width: number;
  height: number;
  // text
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  background?: string;
  textAlign?: Align;
  padding?: number;
  // shape/line
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed";
  thickness?: number; // for line
  orientation?: "horizontal" | "vertical"; // for line
  // photo
  image?: string; // data URL
  objectFit?: "cover" | "contain";
  borderRadius?: string; // e.g., "0", "8px", "50%"
  cropScale?: number; // 1 = normal
  cropPosX?: number; // -1..1
  cropPosY?: number; // -1..1
  // icon / tag
  icon?: string; // key for inline SVG
  tagColor?: string;
  // layer & transforms
  zIndex: number;
  rotation?: number; // degrees
  opacity?: number; // 0..1
  locked?: boolean;
  hidden?: boolean;
};

type Page = { id: string; elements: Elem[] };

type ResumeDoc = {
  _id?: string;
  name: string;
  templateId?: string;
  pages: Page[];
  updatedAt?: string;
};

/*******************************
 * Utilities
 *******************************/
const A4 = { w: 794, h: 1123 };
const GRID = 8;
const genId = (p = "") => `${p}${Math.random().toString(36).slice(2, 9)}`;
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const snap = (v: number, step = GRID) => Math.round(v / step) * step;

function migrateElem(e: Partial<Elem>, idx: number): Elem {
  // Backward-compat with the user's previous Elem shape
  return {
    id: e.id || genId("el-"),
    type: (e.type as ElemType) || "text",
    x: typeof e.x === "number" ? e.x : 60 + idx * 10,
    y: typeof e.y === "number" ? e.y : 60 + idx * 10,
    width: typeof e.width === "number" ? e.width : 180,
    height: typeof e.height === "number" ? e.height : 40,
    text: e.text || (e.type === "text" ? "Double-click to edit" : ""),
    fontSize: e.fontSize ?? 16,
    fontFamily: e.fontFamily || "Arial, sans-serif",
    fontWeight: e.fontWeight ?? 400,
    lineHeight: e.lineHeight ?? 1.4,
    letterSpacing: e.letterSpacing ?? 0,
    color: e.color || "#111827",
    background: e.background ?? (e.type === "text" ? "transparent" : "#E5E7EB"),
    textAlign: (e.textAlign as Align) || "left",
    padding: e.padding ?? 6,
    borderColor: e.borderColor || "#111827",
    borderWidth: e.borderWidth ?? 0,
    borderStyle: e.borderStyle || "solid",
    thickness: e.thickness ?? 4,
    orientation: e.orientation || "horizontal",
    image: e.image,
    objectFit: e.objectFit || "cover",
    borderRadius: e.borderRadius || "0",
    cropScale: e.cropScale ?? 1,
    cropPosX: e.cropPosX ?? 0,
    cropPosY: e.cropPosY ?? 0,
    icon: e.icon || undefined,
    tagColor: e.tagColor || "#E5E7EB",
    zIndex: typeof e.zIndex === "number" ? e.zIndex : 1,
    rotation: e.rotation ?? 0,
    opacity: e.opacity ?? 1,
    locked: e.locked ?? false,
    hidden: e.hidden ?? false,
  };
}

function migratePage(p: any, pageIdx: number): Page {
  return {
    id: p?.id || genId("page-"),
    elements: Array.isArray(p?.elements)
      ? p.elements.map((e: any, i: number) => migrateElem(e, i))
      : [],
  };
}

/*******************************
 * Inline tiny SVG icon set
 *******************************/
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const common = "w-4 h-4" + (className ? ` ${className}` : "");
  switch (name) {
    case "text":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M8 6v12"/></svg>
      );
    case "rect":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="6" width="16" height="12" rx="2"/></svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="6"/></svg>
      );
    case "line":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16"/></svg>
      );
    case "photo":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l4-4 5 5 4-4 5 5"/></svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 13l-7 7-9-9V4h7l9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>
      );
    case "icon":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>
      );
    default:
      return null;
  }
};

/*******************************
 * History (Undo/Redo)
 *******************************/
function useHistory<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const lastPush = useRef<number>(0);

  const set = useCallback((updater: (prev: T) => T, coalesceMs = 200) => {
    setState((prev) => {
      const now = Date.now();
      if (!past.current.length || now - lastPush.current > coalesceMs) {
        past.current.push(prev);
        future.current = [];
        lastPush.current = now;
      } else {
        // coalesce: replace last snapshot
        past.current[past.current.length - 1] = prev;
      }
      return updater(prev);
    });
  }, []);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    setState((curr) => {
      const prev = past.current.pop()!;
      future.current.push(curr);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    setState((curr) => {
      const next = future.current.pop()!;
      past.current.push(curr);
      return next;
    });
  }, []);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return { state, set, undo, redo, canUndo, canRedo } as const;
}

/*******************************
 * Autosave hook
 *******************************/
function useAutosave<T>(value: T, enabled: boolean, saveFn: (val: T) => void, delay = 1500) {
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (timer.current) window.clearTimeout(timer.current);
    // @ts-ignore
    timer.current = window.setTimeout(() => saveFn(value), delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = null;
    };
  }, [value, enabled, delay, saveFn]);
}

/*******************************
 * Fetch helpers (match existing /api/resume contract)
 *******************************/
async function listResumes(): Promise<ResumeDoc[]> {
  const r = await fetch("/api/resume");
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

async function loadResume(id: string): Promise<ResumeDoc | null> {
  const r = await fetch(`/api/resume/${id}`);
  if (!r.ok) return null;
  return await r.json();
}

async function saveResume(doc: ResumeDoc): Promise<ResumeDoc | null> {
  const method = doc._id ? "PUT" : "POST";
  const url = doc._id ? `/api/resume/${doc._id}` : "/api/resume";
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc),
  });
  if (!r.ok) return null;
  return await r.json();
}

async function deleteResume(id: string) {
  const r = await fetch(`/api/resume/${id}`, { method: "DELETE" });
  return r.ok;
}

/*******************************
 * Templates (3 starters)
 *******************************/
const Templates: Record<string, (name?: string) => Page[]> = {
  classic: () => [
    {
      id: genId("page-"),
      elements: [
        migrateElem(
          {
            type: "text",
            x: 60,
            y: 60,
            width: 674,
            height: 48,
            text: "Your Name\nJob Title",
            fontSize: 28,
            fontWeight: 700,
            textAlign: "center",
          },
          0
        ),
        migrateElem(
          {
            type: "line",
            x: 60,
            y: 120,
            width: 674,
            height: 4,
            background: "#E5E7EB",
            thickness: 2,
          },
          1
        ),
        migrateElem(
          {
            type: "text",
            x: 60,
            y: 150,
            width: 674,
            height: 140,
            text:
              "**Summary**\nResults-driven engineer with a passion for building delightful products.",
            fontSize: 14,
          },
          2
        ),
      ],
    },
  ],
  modern: () => [
    {
      id: genId("page-"),
      elements: [
        migrateElem({ type: "rect", x: 0, y: 0, width: A4.w, height: 140, background: "#111827" }, 0),
        migrateElem({ type: "text", x: 60, y: 40, width: 400, height: 48, text: "Your Name", fontSize: 32, color: "#fff", background: "transparent" }, 1),
        migrateElem({ type: "text", x: 60, y: 90, width: 400, height: 24, text: "Job Title", fontSize: 16, color: "#D1D5DB", background: "transparent" }, 2),
      ],
    },
  ],
  compact: () => [
    {
      id: genId("page-"),
      elements: [
        migrateElem({ type: "text", x: 60, y: 60, width: 300, height: 28, text: "Your Name", fontSize: 24, fontWeight: 700 }, 0),
        migrateElem({ type: "tag", x: 370, y: 64, width: 120, height: 24, text: "Available", tagColor: "#DEF7EC" }, 1),
      ],
    },
  ],
};

/*******************************
 * AI request helper
 *******************************/
async function runAI(action: string, section: string, context: any) {
  const r = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, section, context }),
  });
  if (!r.ok) throw new Error("AI request failed");
  const data = await r.json();
  return (data?.text as string) || "";
}

/*******************************
 * Main Component
 *******************************/
export default function ResumeBuilderPage() {
  /*** Core state ***/
  const initialPages = useMemo<Page[]>(
    () => [{ id: genId("page-"), elements: [] }],
    []
  );
  const {
    state: pages,
    set: setPages,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Page[]>(initialPages);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selection, setSelection] = useState<string[]>([]); // multi-select ids
  const [marquee, setMarquee] = useState<null | { x: number; y: number; w: number; h: number }>(null);
  const [fileName, setFileName] = useState("Untitled Resume");
  const [autosave, setAutosave] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [gridOn, setGridOn] = useState(true);

  // NEW: Inline editing state (no alert/prompt)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const currentPage = pages[currentPageIndex];

  /*** Printing ***/
  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: fileName || "Resume" });

  /*** Saved docs ***/
  const [saved, setSaved] = useState<ResumeDoc[]>([]);
  const [editingDocId, setEditingDocId] = useState<string | undefined>(undefined);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    listResumes().then(setSaved).catch(() => setSaved([]));
  }, []);

  const doc: ResumeDoc = useMemo(
    () => ({ _id: editingDocId, name: fileName, templateId: "builder-single", pages }),
    [editingDocId, fileName, pages]
  );

  const doSave = useCallback(async (d: ResumeDoc) => {
    setSavingState("saving");
    const res = await saveResume(d);
    if (!res) {
      setSavingState("error");
      return;
    }
    setSavingState("saved");
    setEditingDocId(res._id);
    setSaved((prev) => {
      const exists = prev.find((p) => p._id === res._id);
      if (exists) return prev.map((p) => (p._id === res._id ? { ...res } : p));
      return [res, ...prev];
    });
    setTimeout(() => setSavingState("idle"), 1000);
  }, []);

  useAutosave(doc, autosave, doSave, 1500);

  /*******************************
   * Selection helpers
   *******************************/
  const setSingleSelection = useCallback((id: string) => setSelection([id]), []);
  const clearSelection = useCallback(() => setSelection([]), []);
  const isSelected = useCallback((id: string) => selection.includes(id), [selection]);
  const selectedElements = useMemo(() => currentPage.elements.filter((e) => selection.includes(e.id)), [currentPage, selection]);

  /*******************************
   * Element CRUD
   *******************************/
  const addElement = useCallback((type: ElemType, extras: Partial<Elem> = {}) => {
    setPages((prev) => {
      const copy = [...prev];
      const p = copy[currentPageIndex];
      const maxZ = p.elements.reduce((m, e) => Math.max(m, e.zIndex || 1), 1);
      const base: Partial<Elem> = {
        type,
        x: 60,
        y: 60,
        width: type === "line" ? 200 : 200,
        height: type === "text" ? 40 : type === "line" ? 4 : 120,
        text: type === "text" ? "Double-click to edit" : type === "tag" ? "Tag" : "",
        zIndex: maxZ + 1,
      };
      const el = migrateElem({ ...base, ...extras }, p.elements.length);
      copy[currentPageIndex] = { ...p, elements: [...p.elements, el] };
      return copy;
    });
  }, [currentPageIndex, setPages]);

  const removeSelected = useCallback(() => {
    if (!selection.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const p = copy[currentPageIndex];
      copy[currentPageIndex] = { ...p, elements: p.elements.filter((e) => !selection.includes(e.id)) };
      return copy;
    });
    clearSelection();
    setEditingId(null);
  }, [selection, currentPageIndex, setPages, clearSelection]);

  const updateElements = useCallback((ids: string[], mut: (e: Elem) => Elem) => {
    if (!ids.length) return;
    setPages((prev) => {
      const copy = [...prev];
      const p = copy[currentPageIndex];
      copy[currentPageIndex] = {
        ...p,
        elements: p.elements.map((e) => (ids.includes(e.id) ? mut(e) : e)),
      };
      return copy;
    });
  }, [currentPageIndex, setPages]);

  const bringToFront = () => {
    const maxZ = Math.max(0, ...currentPage.elements.map((e) => e.zIndex || 1));
    updateElements(selection, (e) => ({ ...e, zIndex: maxZ + 1 }));
  };
  const sendToBack = () => {
    const minZ = Math.min(...currentPage.elements.map((e) => e.zIndex || 1));
    updateElements(selection, (e) => ({ ...e, zIndex: minZ - 1 }));
  };

  /*******************************
   * Drag / Resize / Rotate
   *******************************/
  const dragRef = useRef<null | {
    mode: "move" | "resize" | "rotate";
    ids: string[];
    startX: number;
    startY: number;
    // move
    starts: { id: string; x: number; y: number }[];
    // resize
    startRects: { id: string; x: number; y: number; w: number; h: number }[];
    handle?: "nw" | "ne" | "sw" | "se";
    // rotate
    startAngles?: { id: string; rotation: number }[];
  }>(null);

  const startMove = (e: React.MouseEvent, id: string, additive: boolean) => {
    e.stopPropagation();
    // prevent drag while inline editing this element
    if (editingId === id) return;
    const ids = additive ? Array.from(new Set([...selection, id])) : [id];
    setSelection(ids);
    const starts = ids.map((i) => {
      const el = currentPage.elements.find((x) => x.id === i)!;
      return { id: i, x: el.x, y: el.y };
    });
    dragRef.current = { mode: "move", ids, startX: e.clientX, startY: e.clientY, starts, startRects: [] };
  };

  const startResize = (
    e: React.MouseEvent,
    id: string,
    handle: "nw" | "ne" | "sw" | "se"
  ) => {
    e.stopPropagation();
    if (editingId === id) return;
    const ids = selection.includes(id) ? selection : [id];
    setSelection(ids);
    const startRects = ids.map((i) => {
      const el = currentPage.elements.find((x) => x.id === i)!;
      return { id: i, x: el.x, y: el.y, w: el.width, h: el.height };
    });
    dragRef.current = { mode: "resize", ids, startX: e.clientX, startY: e.clientY, starts: [], startRects, handle };
  };

  const startRotate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editingId === id) return;
    const ids = selection.includes(id) ? selection : [id];
    setSelection(ids);
    const startAngles = ids.map((i) => {
      const el = currentPage.elements.find((x) => x.id === i)!;
      return { id: i, rotation: el.rotation || 0 };
    });
    dragRef.current = { mode: "rotate", ids, startX: e.clientX, startY: e.clientY, starts: [], startRects: [], startAngles };
  };

  useEffect(() => {
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const d = dragRef.current;
      const dx = (ev.clientX - d.startX) / zoom;
      const dy = (ev.clientY - d.startY) / zoom;

      if (d.mode === "move") {
        setPages((prev) => {
          const copy = [...prev];
          const p = copy[currentPageIndex];
          copy[currentPageIndex] = {
            ...p,
            elements: p.elements.map((el) => {
              if (!d.ids.includes(el.id) || el.locked) return el;
              const start = d.starts.find((s) => s.id === el.id)!;
              const nx = gridOn ? snap(start.x + dx) : start.x + dx;
              const ny = gridOn ? snap(start.y + dy) : start.y + dy;
              return { ...el, x: nx, y: ny };
            }),
          };
          return copy;
        }, 0);
      } else if (d.mode === "resize") {
        setPages((prev) => {
          const copy = [...prev];
          const p = copy[currentPageIndex];
          copy[currentPageIndex] = {
            ...p,
            elements: p.elements.map((el) => {
              if (!d.ids.includes(el.id) || el.locked) return el;
              const r = d.startRects.find((s) => s.id === el.id)!;
              let x = r.x,
                y = r.y,
                w = r.w,
                h = r.h;
              if (d.handle === "se") {
                w = r.w + dx;
                h = r.h + dy;
              } else if (d.handle === "ne") {
                w = r.w + dx;
                y = r.y + dy;
                h = r.h - dy;
              } else if (d.handle === "sw") {
                x = r.x + dx;
                w = r.w - dx;
                h = r.h + dy;
              } else if (d.handle === "nw") {
                x = r.x + dx;
                y = r.y + dy;
                w = r.w - dx;
                h = r.h - dy;
              }
              w = Math.max(20, w);
              h = Math.max(el.type === "line" ? 2 : 20, h);
              if (gridOn) {
                x = snap(x);
                y = snap(y);
                w = Math.max(20, snap(w));
                h = Math.max(20, snap(h));
              }
              return { ...el, x, y, width: w, height: h };
            }),
          };
          return copy;
        }, 0);
      } else if (d.mode === "rotate") {
        const angleDelta = (dx + dy) * 0.3; // simple heuristic
        setPages((prev) => {
          const copy = [...prev];
          const p = copy[currentPageIndex];
          copy[currentPageIndex] = {
            ...p,
            elements: p.elements.map((el) => {
              if (!d.ids.includes(el.id) || el.locked) return el;
              const start = d.startAngles!.find((s) => s.id === el.id)!;
              let rot = start.rotation + angleDelta;
              if (gridOn) rot = Math.round(rot / 5) * 5; // snap rotation
              return { ...el, rotation: rot };
            }),
          };
          return copy;
        }, 0);
      }
    };
    const onUp = () => (dragRef.current = null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [currentPageIndex, gridOn, setPages, zoom]);

  /*******************************
   * Keyboard shortcuts
   *******************************/
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") {
        // if editing, exit edit mode first
        if (editingId) {
          setEditingId(null);
          return;
        }
        clearSelection();
      }
      if (cmd && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      // skip element move shortcuts if currently typing inline
      if (editingId) return;

      if (!selection.length) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -delta : e.key === "ArrowRight" ? delta : 0;
        const dy = e.key === "ArrowUp" ? -delta : e.key === "ArrowDown" ? delta : 0;
        updateElements(selection, (el) => ({ ...el, x: gridOn ? snap(el.x + dx) : el.x + dx, y: gridOn ? snap(el.y + dy) : el.y + dy }));
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeSelected();
      }
      if (cmd && e.key.toLowerCase() === "c") {
        e.preventDefault();
        // duplicate as our lightweight copy
        setPages((prev) => {
          const copy = [...prev];
          const p = copy[currentPageIndex];
          const maxZ = Math.max(0, ...p.elements.map((x) => x.zIndex || 1));
          const clones = p.elements
            .filter((x) => selection.includes(x.id))
            .map((x) => ({ ...x, id: genId("el-"), x: x.x + 10, y: x.y + 10, zIndex: maxZ + 1 }));
          copy[currentPageIndex] = { ...p, elements: [...p.elements, ...clones] };
          return copy;
        });
      }
      if (cmd && e.key.toLowerCase() === "a") {
        e.preventDefault();
        // open AI panel toggle handled by button (we avoid hijacking global)
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selection, removeSelected, updateElements, gridOn, undo, redo, setPages, currentPageIndex, clearSelection, editingId]);

  /*******************************
   * Marquee select
   *******************************/
  const canvasBoundsRef = useRef<HTMLDivElement | null>(null);
  const onCanvasMouseDown = (e: React.MouseEvent) => {
    // only left click
    if (e.button !== 0) return;
    if (e.target === canvasBoundsRef.current) {
      const rect = (e.target as HTMLDivElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      setMarquee({ x, y, w: 0, h: 0 });
      setSelection([]);
      setEditingId(null);
    }
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!marquee) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x2 = (e.clientX - rect.left) / zoom;
    const y2 = (e.clientY - rect.top) / zoom;
    setMarquee((m) => (m ? { ...m, w: x2 - m.x, h: y2 - m.y } : null));
  };
  const onCanvasMouseUp = () => {
    if (!marquee) return;
    const mx = Math.min(marquee.x, marquee.x + marquee.w);
    const my = Math.min(marquee.y, marquee.y + marquee.h);
    const mw = Math.abs(marquee.w);
    const mh = Math.abs(marquee.h);
    const ids = currentPage.elements
      .filter((el) => !(el.hidden || el.locked))
      .filter((el) => el.x >= mx && el.y >= my && el.x + el.width <= mx + mw && el.y + el.height <= my + mh)
      .map((el) => el.id);
    setSelection(ids);
    setMarquee(null);
    setEditingId(null);
  };

  /*******************************
   * AI Panel (inline)
   *******************************/
  const [aiOpen, setAiOpen] = useState(false);
  const [aiAction, setAiAction] = useState("");
  const [aiSection, setAiSection] = useState("objective");
  const [aiJob, setAiJob] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const selectedTextForAI = selectedElements.find((e) => e.type === "text")?.text || "";

  const runAICall = async () => {
    if (!aiAction) return alert("Choose an action");
    setAiLoading(true);
    try {
      const ctx = {
        pages,
        selectedText: selectedTextForAI,
        jobRole: aiJob,
      };
      const txt = await runAI(aiAction, aiSection || "objective", ctx);
      setAiResult(txt);
    } catch (e) {
      setAiResult("AI request failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIToSelection = () => {
    if (!aiResult) return;
    if (!selectedElements.length) {
      // insert new text element
      addElement("text", { text: aiResult, width: 400, height: 120, x: 80, y: 80 });
      return;
    }
    updateElements(selectedElements.map((e) => e.id), (e) => ({ ...e, text: aiResult }));
  };

  /*******************************
   * Templates & Pages
   *******************************/
  const applyTemplate = (key: keyof typeof Templates) => {
    if (!confirm("Replace current pages with template?")) return;
    const p = Templates[key]();
    setPages(() => p);
    setCurrentPageIndex(0);
    setSelection([]);
    setEditingId(null);
  };

  const addPage = () => setPages((prev) => [...prev, { id: genId("page-"), elements: [] }]);
  const duplicatePage = () => setPages((prev) => {
    const copy = [...prev];
    const src = copy[currentPageIndex];
    const dupe: Page = {
      id: genId("page-"),
      elements: src.elements.map((e) => ({ ...e, id: genId("el-"), x: e.x + 6, y: e.y + 6 })),
    };
    copy.splice(currentPageIndex + 1, 0, dupe);
    return copy;
  });
  const deletePage = () => {
    if (!confirm("Delete this page?")) return;
    setPages((prev) => {
      if (prev.length === 1) return prev; // keep at least one
      const copy = [...prev];
      copy.splice(currentPageIndex, 1);
      return copy;
    });
    setCurrentPageIndex((i) => Math.max(0, i - 1));
    setSelection([]);
    setEditingId(null);
  };

  /*******************************
   * Render helpers
   *******************************/
  const elementStyle = (el: Elem): React.CSSProperties => ({
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.width,
    height: el.height,
    transform: `rotate(${el.rotation || 0}deg)`,
    transformOrigin: "center center",
    opacity: el.opacity ?? 1,
    zIndex: el.zIndex,
    userSelect: "none",
    boxSizing: "border-box",
    pointerEvents: el.locked ? "none" : "auto",
  });

  const ResizeHandle = ({ onMouseDown, pos }: { onMouseDown: (e: React.MouseEvent) => void; pos: "nw" | "ne" | "sw" | "se" }) => (
    <div
      onMouseDown={onMouseDown}
      className={`absolute w-2.5 h-2.5 bg-indigo-500 ${
        pos === "nw"
          ? "-left-1.5 -top-1.5 cursor-nwse-resize"
          : pos === "ne"
          ? "-right-1.5 -top-1.5 cursor-nesw-resize"
          : pos === "sw"
          ? "-left-1.5 -bottom-1.5 cursor-nesw-resize"
          : "-right-1.5 -bottom-1.5 cursor-nwse-resize"
      }`}
    />
  );

  const RotateHandle = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
    <div onMouseDown={onMouseDown} className="absolute left-1/2 -translate-x-1/2 -top-6 w-3 h-3 rounded-full bg-indigo-500 cursor-grab" />
  );

  /*******************************
   * UI
   *******************************/
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      {/* Topbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            className="rounded bg-gray-800 px-3 py-2 text-white outline-none ring-1 ring-gray-700"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            aria-label="File name"
          />
          <span className="text-xs text-gray-400">
            {savingState === "saving" && "Saving..."}
            {savingState === "saved" && "Saved"}
            {savingState === "error" && "Save failed"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutosave((v) => !v)}
            className={`rounded px-2 py-2 text-sm ring-1 ring-gray-700 ${autosave ? "bg-emerald-600" : "bg-gray-800"}`}
            title="Toggle autosave"
          >
            {autosave ? "Autosave: On" : "Autosave: Off"}
          </button>
          <button onClick={() => doSave(doc)} className="rounded bg-emerald-600 px-3 py-2 text-sm">Save</button>
          <button onClick={handlePrint} className="rounded bg-blue-600 px-3 py-2 text-sm">Export PDF</button>
          <button disabled={!canUndo} onClick={undo} className="rounded bg-gray-800 px-3 py-2 text-sm ring-1 ring-gray-700 disabled:opacity-50">Undo</button>
          <button disabled={!canRedo} onClick={redo} className="rounded bg-gray-800 px-3 py-2 text-sm ring-1 ring-gray-700 disabled:opacity-50">Redo</button>
          <select
            className="rounded bg-gray-800 px-2 py-2 text-sm ring-1 ring-gray-700"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((z) => (
              <option key={z} value={z}>{Math.round(z * 100)}%</option>
            ))}
          </select>
          <button onClick={() => setGridOn((v) => !v)} className="rounded bg-gray-800 px-3 py-2 text-sm ring-1 ring-gray-700">{gridOn ? "Grid: On" : "Grid: Off"}</button>
        </div>
      </div>

      {/* Toolbar & Inspector */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <aside className="rounded bg-gray-800 p-3 ring-1 ring-gray-700 md:col-span-1">
          <h3 className="mb-2 font-semibold">Toolbar</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addElement("text")} className="flex items-center gap-2 rounded bg-gray-900 px-2 py-2 ring-1 ring-gray-700"><Icon name="text"/>Text</button>
            <button onClick={() => addElement("rect")} className="flex items-center gap-2 rounded bg-gray-900 px-2 py-2 ring-1 ring-gray-700"><Icon name="rect"/>Rect</button>
            <button onClick={() => addElement("circle")} className="flex items-center gap-2 rounded bg-gray-900 px-2 py-2 ring-1 ring-gray-700"><Icon name="circle"/>Circle</button>
            <button onClick={() => addElement("line", { height: 4, thickness: 4 })} className="flex items-center gap-2 rounded bg-gray-900 px-2 py-2 ring-1 ring-gray-700"><Icon name="line"/>Line</button>
            <label className="flex cursor-pointer items-center gap-2 rounded bg-gray-900 px-2 py-2 ring-1 ring-gray-700">
              <Icon name="photo"/> Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5_000_000) return alert("Image too large (max 5MB)");
                const reader = new FileReader();
                reader.onload = () => addElement("photo", { image: String(reader.result), width: 180, height: 180, objectFit: "cover" });
                reader.readAsDataURL(file);
                e.currentTarget.value = "";
              }} />
            </label>
            <button onClick={() => addElement("tag", { text: "Tag", tagColor: "#FDE68A", height: 28, width: 100 })} className="flex items-center gap-2 rounded bg-gray-900 px-2 py-2 ring-1 ring-gray-700"><Icon name="tag"/>Tag</button>
          </div>

          <h4 className="mt-4 text-sm font-semibold">Templates</h4>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <button onClick={() => applyTemplate("classic")} className="rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Classic</button>
            <button onClick={() => applyTemplate("modern")} className="rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Modern</button>
            <button onClick={() => applyTemplate("compact")} className="rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Compact</button>
          </div>

          <h4 className="mt-4 text-sm font-semibold">Pages</h4>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <button onClick={addPage} className="rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Add</button>
            <button onClick={duplicatePage} className="rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Duplicate</button>
            <button onClick={deletePage} className="rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Delete</button>
          </div>

          <h4 className="mt-4 text-sm font-semibold">Saved</h4>
          <div className="mt-2 max-h-48 space-y-2 overflow-auto">
            {saved.length === 0 ? (
              <div className="text-xs text-gray-400">No saved resumes</div>
            ) : (
              saved.map((r) => (
                <div key={r._id || r.name} className="flex items-center justify-between rounded bg-gray-900 p-2 text-xs ring-1 ring-gray-700">
                  <div className="w-36 truncate" title={r.name}>{r.name}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={async () => {
                        const res = await loadResume(r._id!);
                        if (!res) return alert("Failed to load");
                        setPages(() => (res.pages?.length ? res.pages.map(migratePage) : [{ id: genId("page-"), elements: [] }]));
                        setFileName(res.name || "Untitled Resume");
                        setEditingDocId(res._id);
                        setCurrentPageIndex(0);
                        setSelection([]);
                        setEditingId(null);
                      }}
                      className="rounded bg-yellow-600 px-2 py-1"
                    >Edit</button>
                    <button
                      onClick={async () => {
                        if (!r._id) return;
                        if (!confirm("Delete this resume?")) return;
                        const ok = await deleteResume(r._id);
                        if (!ok) return alert("Delete failed");
                        setSaved((prev) => prev.filter((x) => x._id !== r._id));
                        if (editingDocId === r._id) {
                          setEditingDocId(undefined);
                          setPages(() => [{ id: genId("page-"), elements: [] }]);
                          setFileName("Untitled Resume");
                          setCurrentPageIndex(0);
                          setSelection([]);
                          setEditingId(null);
                        }
                      }}
                      className="rounded bg-red-600 px-2 py-1"
                    >Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <h4 className="mt-4 text-sm font-semibold">Selection</h4>
          {!selection.length ? (
            <div className="mt-1 text-xs text-gray-400">None</div>
          ) : (
            <div className="mt-2 space-y-2 text-xs">
              <button onClick={bringToFront} className="w-full rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Bring to Front</button>
              <button onClick={sendToBack} className="w-full rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Send to Back</button>
              <button onClick={() => updateElements(selection, (e) => ({ ...e, locked: !e.locked }))} className="w-full rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Toggle Lock</button>
              <button onClick={() => updateElements(selection, (e) => ({ ...e, hidden: !e.hidden }))} className="w-full rounded bg-gray-900 px-2 py-1 ring-1 ring-gray-700">Toggle Hide</button>
              <button onClick={removeSelected} className="w-full rounded bg-red-700 px-2 py-1">Delete</button>
            </div>
          )}
        </aside>

        {/* Canvas + Inspector */}
        <main className="md:col-span-3 flex items-start gap-4">
          {/* Canvas */}
          <div className="flex-1">
            <div className="mb-2 text-sm text-gray-400">Canvas (drag, resize corners, rotate dot; Double‑click to edit inline; Shift+Click to multi-select; arrows to nudge)</div>
            <div
              className="mx-auto bg-white ring-1 ring-gray-700"
              style={{ width: A4.w * zoom, height: A4.h * zoom, position: "relative", overflow: "hidden" }}
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              ref={canvasBoundsRef}
              role="region"
              aria-label="Design canvas"
            >
              {/* grid */}
              {gridOn && (
                <svg width={A4.w * zoom} height={A4.h * zoom} style={{ position: "absolute", inset: 0 }}>
                  <defs>
                    <pattern id="grid" width={GRID * zoom} height={GRID * zoom} patternUnits="userSpaceOnUse">
                      <path d={`M ${GRID * zoom} 0 L 0 0 0 ${GRID * zoom}`} fill="none" stroke="#eee" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              )}

              {/* elements */}
              {currentPage.elements
                .slice()
                .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
                .map((el) => {
                  if (el.hidden) return null;
                  const selected = isSelected(el.id);
                  const base = elementStyle(el);
                  // scale styles for zoom (we scale container, not each element)
                  const wrapStyle: React.CSSProperties = {
                    position: "absolute",
                    left: (el.x) * zoom,
                    top: (el.y) * zoom,
                    width: el.width * zoom,
                    height: el.height * zoom,
                    zIndex: el.zIndex,
                  };
                  const contentStyle: React.CSSProperties = {
                    ...base,
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    border: selected ? "2px dashed #2563eb" : undefined,
                    background: el.type === "text" ? (el.background || "transparent") : el.background,
                  };

                  const showHandles = selected && !el.locked && editingId !== el.id;
                  const selectionHandles = showHandles && (
                    <>
                      <ResizeHandle pos="nw" onMouseDown={(e) => startResize(e, el.id, "nw")} />
                      <ResizeHandle pos="ne" onMouseDown={(e) => startResize(e, el.id, "ne")} />
                      <ResizeHandle pos="sw" onMouseDown={(e) => startResize(e, el.id, "sw")} />
                      <ResizeHandle pos="se" onMouseDown={(e) => startResize(e, el.id, "se")} />
                      <RotateHandle onMouseDown={(e) => startRotate(e, el.id)} />
                    </>
                  );

                  if (el.type === "text") {
                    const isEditing = editingId === el.id;
                    return (
                      <div key={el.id} style={wrapStyle}>
                        <div
                          style={contentStyle}
                          onMouseDown={(e) => startMove(e, el.id, e.shiftKey)}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingId(el.id);
                            setEditingValue(el.text || "");
                            setSingleSelection(el.id);
                          }}
                        >
                          {isEditing ? (
                            <textarea
                              value={editingValue}
                              onChange={(e) => {
                                setEditingValue(e.target.value);
                                // real-time update
                                updateElements([el.id], (x) => ({ ...x, text: e.target.value }));
                              }}
                              autoFocus
                              onBlur={() => setEditingId(null)}
                              onKeyDown={(e) => {
                                if ((e.key === "Enter" && (e.metaKey || e.ctrlKey)) || e.key === "Escape") {
                                  e.preventDefault();
                                  setEditingId(null);
                                }
                              }}
                              className="h-full w-full resize-none border-none bg-transparent p-0 outline-none"
                              style={{
                                color: el.color,
                                fontSize: el.fontSize,
                                fontFamily: el.fontFamily,
                                fontWeight: el.fontWeight,
                                lineHeight: el.lineHeight,
                                letterSpacing: el.letterSpacing,
                                textAlign: el.textAlign,
                                padding: el.padding,
                                whiteSpace: "pre-wrap",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                color: el.color,
                                fontSize: el.fontSize,
                                fontFamily: el.fontFamily,
                                fontWeight: el.fontWeight,
                                lineHeight: el.lineHeight,
                                letterSpacing: el.letterSpacing,
                                textAlign: el.textAlign,
                                padding: el.padding,
                                overflow: "hidden",
                                whiteSpace: "pre-wrap",
                                background: "transparent",
                              }}
                            >
                              {el.text}
                            </div>
                          )}
                          {selectionHandles}
                        </div>
                      </div>
                    );
                  }

                  if (el.type === "rect" || el.type === "circle") {
                    return (
                      <div key={el.id} style={wrapStyle}>
                        <div
                          style={{
                            ...contentStyle,
                            border: (el.borderWidth || 0) > 0 ? `${el.borderWidth}px ${el.borderStyle} ${el.borderColor}` : undefined,
                            borderRadius: el.type === "circle" ? "50%" : el.borderRadius,
                          }}
                          onMouseDown={(e) => startMove(e, el.id, e.shiftKey)}
                        >
                          {selectionHandles}
                        </div>
                      </div>
                    );
                  }

                  if (el.type === "line") {
                    const thickness = el.thickness || 4;
                    return (
                      <div key={el.id} style={wrapStyle}>
                        <div
                          style={{
                            ...contentStyle,
                            height: thickness * zoom,
                            top: ((el.height * zoom) - thickness * zoom) / 2,
                            background: el.background || "#111827",
                          }}
                          onMouseDown={(e) => startMove(e, el.id, e.shiftKey)}
                        >
                          {selectionHandles}
                        </div>
                      </div>
                    );
                  }

                  if (el.type === "photo") {
                    return (
                      <div key={el.id} style={wrapStyle}>
                        <div
                          style={{ ...contentStyle, overflow: "hidden", borderRadius: el.borderRadius }}
                          onMouseDown={(e) => startMove(e, el.id, e.shiftKey)}
                        >
                          {el.image && (
                            <img
                              src={el.image}
                              alt=""
                              draggable={false}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: el.objectFit || "cover",
                                transform: `scale(${el.cropScale || 1}) translate(${(el.cropPosX || 0) * 5}%, ${(el.cropPosY || 0) * 5}%)`,
                              }}
                            />
                          )}
                          {selectionHandles}
                        </div>
                      </div>
                    );
                  }

                  if (el.type === "tag") {
                    const isEditing = editingId === el.id;
                    return (
                      <div key={el.id} style={wrapStyle}>
                        <div
                          style={{
                            ...contentStyle,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: el.tagColor || "#EEE",
                            borderRadius: "9999px",
                            color: "#111827",
                            fontWeight: 600,
                          }}
                          onMouseDown={(e) => startMove(e, el.id, e.shiftKey)}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingId(el.id);
                            setEditingValue(el.text || "");
                            setSingleSelection(el.id);
                          }}
                        >
                          {isEditing ? (
                            <input
                              value={editingValue}
                              onChange={(e) => {
                                setEditingValue(e.target.value);
                                updateElements([el.id], (x) => ({ ...x, text: e.target.value }));
                              }}
                              autoFocus
                              onBlur={() => setEditingId(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Escape") {
                                  e.preventDefault();
                                  setEditingId(null);
                                }
                              }}
                              className="w-full bg-transparent text-center outline-none"
                              style={{ padding: el.padding, color: "#111827", fontWeight: 600 }}
                            />
                          ) : (
                            el.text
                          )}
                          {selectionHandles}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}

              {/* marquee */}
              {marquee && (
                <div
                  style={{
                    position: "absolute",
                    left: Math.min(marquee.x, marquee.x + marquee.w) * zoom,
                    top: Math.min(marquee.y, marquee.y + marquee.h) * zoom,
                    width: Math.abs(marquee.w) * zoom,
                    height: Math.abs(marquee.h) * zoom,
                    border: "1px dashed #2563eb",
                    background: "rgba(37, 99, 235, 0.08)",
                  }}
                />)
              }
            </div>

            {/* Page nav */}
            <div className="mt-3 flex flex-wrap gap-2">
              {pages.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentPageIndex(i);
                    setSelection([]);
                    setEditingId(null);
                  }}
                  className={`rounded px-2 py-1 text-sm ring-1 ring-gray-700 ${i === currentPageIndex ? "bg-indigo-600" : "bg-gray-800"}`}
                >
                  Page {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Inspector */}
          <aside className="w-72 shrink-0 rounded bg-gray-800 p-3 ring-1 ring-gray-700">
            <h3 className="mb-2 font-semibold">Inspector</h3>
            {!selection.length ? (
              <div className="text-sm text-gray-400">No selection</div>
            ) : (
              <div className="space-y-3 text-sm">
                {selectedElements.length === 1 && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">Position & Size</div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2">X<input className="w-full rounded bg-gray-900 px-2 py-1" type="number" value={selectedElements[0].x} onChange={(e) => updateElements(selection, (el) => ({ ...el, x: Number(e.target.value) }))} /></label>
                      <label className="flex items-center gap-2">Y<input className="w-full rounded bg-gray-900 px-2 py-1" type="number" value={selectedElements[0].y} onChange={(e) => updateElements(selection, (el) => ({ ...el, y: Number(e.target.value) }))} /></label>
                      <label className="flex items-center gap-2">W<input className="w-full rounded bg-gray-900 px-2 py-1" type="number" value={selectedElements[0].width} onChange={(e) => updateElements(selection, (el) => ({ ...el, width: Number(e.target.value) }))} /></label>
                      <label className="flex items-center gap-2">H<input className="w-full rounded bg-gray-900 px-2 py-1" type="number" value={selectedElements[0].height} onChange={(e) => updateElements(selection, (el) => ({ ...el, height: Number(e.target.value) }))} /></label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2">Rot<input className="w-full rounded bg-gray-900 px-2 py-1" type="number" value={selectedElements[0].rotation || 0} onChange={(e) => updateElements(selection, (el) => ({ ...el, rotation: Number(e.target.value) }))} /></label>
                      <label className="flex items-center gap-2">Opacity<input className="w-full rounded bg-gray-900 px-2 py-1" type="number" step={0.05} min={0} max={1} value={selectedElements[0].opacity ?? 1} onChange={(e) => updateElements(selection, (el) => ({ ...el, opacity: clamp(Number(e.target.value), 0, 1) }))} /></label>
                    </div>
                  </div>
                )}

                {/* Common styling */}
                {selectedElements.some((e) => e.type === "text") && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">Text</div>
                    <label className="block">Font family
                      <select className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].fontFamily} onChange={(e) => updateElements(selection, (el) => ({ ...el, fontFamily: e.target.value }))}>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Noto Sans', sans-serif">Noto Sans</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="Georgia, serif">Georgia</option>
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label>Size<input type="number" className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].fontSize || 16} onChange={(e) => updateElements(selection, (el) => ({ ...el, fontSize: Number(e.target.value) }))} /></label>
                      <label>Weight<input type="number" className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].fontWeight || 400} onChange={(e) => updateElements(selection, (el) => ({ ...el, fontWeight: Number(e.target.value) }))} /></label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label>Line<input type="number" step={0.1} className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].lineHeight || 1.4} onChange={(e) => updateElements(selection, (el) => ({ ...el, lineHeight: Number(e.target.value) }))} /></label>
                      <label>Letter<input type="number" step={0.1} className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].letterSpacing || 0} onChange={(e) => updateElements(selection, (el) => ({ ...el, letterSpacing: Number(e.target.value) }))} /></label>
                    </div>
                    <label>Align
                      <select className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].textAlign || "left"} onChange={(e) => updateElements(selection, (el) => ({ ...el, textAlign: e.target.value as Align }))}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                    <label>Color<input type="color" className="mt-1 w-full" value={selectedElements[0].color || "#111827"} onChange={(e) => updateElements(selection, (el) => ({ ...el, color: e.target.value }))} /></label>
                    <label>Background<input type="color" className="mt-1 w-full" value={selectedElements[0].background || "#00000000"} onChange={(e) => updateElements(selection, (el) => ({ ...el, background: e.target.value }))} /></label>
                    <label>Padding<input type="number" className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].padding || 6} onChange={(e) => updateElements(selection, (el) => ({ ...el, padding: Number(e.target.value) }))} /></label>
                  </div>
                )}

                {selectedElements.some((e) => e.type === "rect" || e.type === "circle") && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">Shape</div>
                    <label>Fill<input type="color" className="mt-1 w-full" value={selectedElements[0].background || "#E5E7EB"} onChange={(e) => updateElements(selection, (el) => ({ ...el, background: e.target.value }))} /></label>
                    <label>Border color<input type="color" className="mt-1 w-full" value={selectedElements[0].borderColor || "#111827"} onChange={(e) => updateElements(selection, (el) => ({ ...el, borderColor: e.target.value }))} /></label>
                    <label>Border width<input type="number" className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].borderWidth || 0} onChange={(e) => updateElements(selection, (el) => ({ ...el, borderWidth: Number(e.target.value) }))} /></label>
                    <label>Border style
                      <select className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].borderStyle || "solid"} onChange={(e) => updateElements(selection, (el) => ({ ...el, borderStyle: e.target.value as any }))}>
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                      </select>
                    </label>
                    <label>Radius<input type="text" className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].borderRadius || "0"} onChange={(e) => updateElements(selection, (el) => ({ ...el, borderRadius: e.target.value }))} /></label>
                  </div>
                )}

                {selectedElements.some((e) => e.type === "line") && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">Line</div>
                    <label>Color<input type="color" className="mt-1 w-full" value={selectedElements[0].background || "#111827"} onChange={(e) => updateElements(selection, (el) => ({ ...el, background: e.target.value }))} /></label>
                    <label>Thickness<input type="number" className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].thickness || 4} onChange={(e) => updateElements(selection, (el) => ({ ...el, thickness: Number(e.target.value) }))} /></label>
                  </div>
                )}

                {selectedElements.some((e) => e.type === "photo") && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">Photo</div>
                    <label>Fit
                      <select className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].objectFit || "cover"} onChange={(e) => updateElements(selection, (el) => ({ ...el, objectFit: e.target.value as any }))}>
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                      </select>
                    </label>
                    <label>Shape
                      <select className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].borderRadius || "0"} onChange={(e) => updateElements(selection, (el) => ({ ...el, borderRadius: e.target.value }))}>
                        <option value="0">Rectangle</option>
                        <option value="8px">Rounded</option>
                        <option value="50%">Circle</option>
                      </select>
                    </label>
                    <label>Scale<input type="number" step={0.05} className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].cropScale || 1} onChange={(e) => updateElements(selection, (el) => ({ ...el, cropScale: Number(e.target.value) }))} /></label>
                    <div className="grid grid-cols-2 gap-2">
                      <label>Pos X<input type="number" step={0.1} className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].cropPosX || 0} onChange={(e) => updateElements(selection, (el) => ({ ...el, cropPosX: Number(e.target.value) }))} /></label>
                      <label>Pos Y<input type="number" step={0.1} className="mt-1 w-full rounded bg-gray-900 px-2 py-1" value={selectedElements[0].cropPosY || 0} onChange={(e) => updateElements(selection, (el) => ({ ...el, cropPosY: Number(e.target.value) }))} /></label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Button */}
            <button onClick={() => setAiOpen(true)} className="mt-4 w-full rounded bg-indigo-600 px-3 py-2 text-sm">✨ AI Assistant</button>
          </aside>
        </main>
      </div>

      {/* AI Slide-over */}
      {aiOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setAiOpen(false)} />
          <aside className="fixed left-0 top-0 z-50 h-full w-full max-w-md bg-gray-900 p-4 ring-1 ring-gray-700">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <button onClick={() => setAiOpen(false)} className="rounded px-2 py-1 ring-1 ring-gray-700">Close</button>
            </div>
            <label className="block text-sm">Action
              <select className="mt-1 w-full rounded bg-gray-800 px-2 py-2" value={aiAction} onChange={(e) => setAiAction(e.target.value)}>
                <option value="">Select action</option>
                <option value="generate_section">Generate Section</option>
                <option value="suggest_skills">Suggest Skills</option>
                <option value="proofread">Proofread Text</option>
                <option value="layout_optimize">Optimize Layout</option>
                <option value="resume_summary">Resume Summary</option>
                <option value="job_match">Job Match</option>
              </select>
            </label>
            {aiAction === "generate_section" && (
              <label className="mt-2 block text-sm">Section
                <input className="mt-1 w-full rounded bg-gray-800 px-2 py-2" value={aiSection} onChange={(e) => setAiSection(e.target.value)} placeholder="objective" />
              </label>
            )}
            {aiAction === "job_match" && (
              <label className="mt-2 block text-sm">Job role
                <input className="mt-1 w-full rounded bg-gray-800 px-2 py-2" value={aiJob} onChange={(e) => setAiJob(e.target.value)} placeholder="Frontend Engineer (React, Next.js)" />
              </label>
            )}
            <div className="mt-3 rounded bg-gray-800/60 p-2 text-xs text-gray-300">
              <div className="mb-1 font-semibold text-gray-200">Selected Text Context</div>
              <div className="line-clamp-3 whitespace-pre-wrap">{selectedTextForAI || "— (none) —"}</div>
            </div>
            <button disabled={aiLoading} onClick={runAICall} className="mt-3 w-full rounded bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50">{aiLoading ? "Processing..." : "Run AI"}</button>
            <label className="mt-3 block text-sm">AI Result
              <textarea className="mt-1 h-40 w-full resize-none rounded bg-gray-800 p-2 text-sm" value={aiResult} onChange={(e) => setAiResult(e.target.value)} placeholder="AI output..." />
            </label>
            <div className="mt-2 flex items-center justify-between">
              <button onClick={() => navigator.clipboard.writeText(aiResult || "")} className="rounded px-3 py-1 text-sm ring-1 ring-gray-700">Copy</button>
              <button onClick={applyAIToSelection} disabled={!aiResult} className="rounded bg-emerald-600 px-3 py-1 text-sm disabled:opacity-50">Apply</button>
            </div>
            <div className="mt-2 text-xs text-gray-500">Tip: Select a text element to overwrite its content, or we’ll insert a new text box.</div>
          </aside>
        </>
      )}

      {/* Hidden printable DOM */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {pages.map((p, pageIndex) => (
            <div key={p.id} style={{ width: A4.w, height: A4.h, position: "relative", background: "#fff" }}>
              {p.elements.map((el) => {
                if (el.hidden) return null;
                const base: React.CSSProperties = {
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  transform: `rotate(${el.rotation || 0}deg)`,
                  transformOrigin: "center center",
                  opacity: el.opacity ?? 1,
                  color: el.color,
                };
                if (el.type === "text") {
                  return (
                    <div key={el.id} style={{ ...base, padding: el.padding, background: el.background === "transparent" ? "transparent" : el.background }}>
                      <div
                        style={{ textAlign: el.textAlign, fontSize: el.fontSize, fontFamily: el.fontFamily, fontWeight: el.fontWeight, lineHeight: el.lineHeight, letterSpacing: el.letterSpacing }}
                        dangerouslySetInnerHTML={{ __html: marked.parse(el.text || "") as string }}
                      />
                    </div>
                  );
                }
                if (el.type === "rect" || el.type === "circle") {
                  return (
                    <div key={el.id} style={{ ...base, background: el.background, borderRadius: el.type === "circle" ? "50%" : el.borderRadius, border: (el.borderWidth || 0) > 0 ? `${el.borderWidth}px ${el.borderStyle} ${el.borderColor}` : undefined }} />
                  );
                }
                if (el.type === "line") {
                  return <div key={el.id} style={{ ...base, height: el.thickness || 4, background: el.background || "#111827", top: el.y + el.height / 2 - (el.thickness || 4) / 2 }} />;
                }
                if (el.type === "photo") {
                  return (
                    <div key={el.id} style={{ ...base, overflow: "hidden", borderRadius: el.borderRadius }}>
                      {el.image && (
                        <img
                          src={el.image}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: el.objectFit || "cover", transform: `scale(${el.cropScale || 1}) translate(${(el.cropPosX || 0) * 5}%, ${(el.cropPosY || 0) * 5}%)` }}
                        />
                      )}
                    </div>
                  );
                }
                if (el.type === "tag") {
                  return (
                    <div key={el.id} style={{ ...base, display: "flex", alignItems: "center", justifyContent: "center", background: el.tagColor || "#EEE", borderRadius: 9999, fontWeight: 600, color: "#111827" }}>
                      {el.text}
                    </div>
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
          @page { size: A4; margin: 0; }
          [data-radix-popper-content-wrapper] { display: none !important; }
        }
      `}</style>

      {/* Floating AI shortcut */}
      <button
        onClick={() => setAiOpen(true)}
        className="fixed left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 ring-2 ring-gray-700 hover:ring-indigo-500"
        title="Open AI Assistant"
        aria-label="Open AI Assistant"
      >
        ✨
      </button>

      {/* HOW TO TEST (quick):
        1) Ensure Tailwind + App Router are set up. Install deps: `npm i react-to-print marked`.
        2) Create file at app/resume-builder/page.tsx and paste this code.
        3) Start dev server. Add text/rect/photo. Drag & resize. Shift+click to multi-select.
        4) Double‑click any text or tag to edit inline (Esc/⌘+Enter to finish).
        5) Use Inspector to style. Try templates. Save (uses /api/resume). Export PDF.
        6) Shortcuts: Esc clears selection; Cmd/Ctrl+Z / Shift+Cmd/Ctrl+Z; arrows nudge (Shift=10px); Delete removes.
      */}
    </div>
  );
}
