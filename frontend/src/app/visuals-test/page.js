// FILE: visuals-test/page.js
"use client";
import React, { useState } from "react";
import ImageCard from "../components/ImageCard";
import axios from "axios";

const API_URL = "http://localhost:8000";

export default function VisualsTestPage() {
  const [sampleText, setSampleText] = useState("");
  const [visuals, setVisuals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setVisuals([]);

    try {
      // Step 1: Describe the visual
      const descRes = await axios.post(`${API_URL}/describe-visual`, {
        prompt: sampleText,
      });
      const description = descRes.data.description;

      // Step 2: Generate SVG
      const svgRes = await axios.post(`${API_URL}/generate-svg`, {
        description,
      });
      const svg = svgRes.data.svg;

      setVisuals([{ description, svg }]);
    } catch (err) {
      setError("Something went wrong while generating the visual. 😓");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 bg-purple-100 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-800 mb-4">
        🧪 Test Visual Generation
      </h1>

      <textarea
        className="w-full p-4 rounded-xl border border-purple-300 mb-4"
        rows={5}
        value={sampleText}
        onChange={(e) => setSampleText(e.target.value)}
        placeholder="Enter a short visual cue like 'free-body diagram of a pendulum'..."
      />

      <button
        className="bg-purple-600 text-white font-bold py-2 px-6 rounded-xl hover:scale-105"
        onClick={handleGenerate}
        disabled={loading || !sampleText.trim()}
      >
        {loading ? "Summoning SVG magic..." : "Generate Visual"}
      </button>

      {error && (
        <div className="text-red-600 mt-4 font-semibold">{error}</div>
      )}

      <div className="mt-6">
        {visuals.map((v, i) => (
          <ImageCard key={i} description={v.description} svg={v.svg} />
        ))}
      </div>
    </div>
  );
}
