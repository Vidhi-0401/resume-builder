"use client";

import React, { useState } from "react";

interface AIModalProps {
  onClose: () => void;
}

export default function AIModal({ onClose }: AIModalProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return alert("Please enter a prompt");
    setLoading(true);
    setGeneratedText("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setGeneratedText(data.output || "No content generated.");
    } catch (err) {
      console.error("AI generation error:", err);
      alert("Something went wrong with AI generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* 👇 Added text-black here to make all modal text black */}
      <div className="bg-white text-black rounded-2xl p-6 w-full max-w-md relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-700"
        >
          ✖
        </button>

        {/* 👇 This text will now be black */}
        <h2 className="text-xl font-semibold mb-4 text-center text-black">
          ✨ AI Resume Generator
        </h2>

        <textarea
          className="w-full border rounded-lg p-3 text-sm text-black"
          placeholder="Describe your experience, skills, or target role..."
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          className="w-full bg-purple-600 text-white py-2 mt-3 rounded-lg hover:bg-purple-700 transition"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Resume with AI"}
        </button>

        {generatedText && (
          <div className="mt-4 p-3 border rounded-lg bg-gray-50 text-sm text-black">
            <h3 className="font-semibold mb-2">Generated Resume:</h3>
            <p className="text-black">{generatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
