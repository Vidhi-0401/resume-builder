"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  uid: string; // unique id for this draggable instance
  label: string;
  onRemove: (uid: string) => void;
};

export default function SortableItem({ uid, label, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: uid });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex justify-between items-center bg-white border p-3 rounded shadow-sm"
    >
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-gray-500">uid: {uid}</div>
      </div>

      <button
        onClick={() => onRemove(uid)}
        title="Remove"
        className="ml-4 inline-flex items-center justify-center h-8 w-8 rounded bg-red-100 text-red-600 hover:bg-red-200"
      >
        ✕
      </button>
    </div>
  );
}
