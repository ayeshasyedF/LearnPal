"use client";
import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

export default function VisualsTestPage() {
  const [sampleText, setSampleText] = useState("");
  const [visuals, setVisuals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDescription, setShowDescription] = useState(false);

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setVisuals([]);

    try {
      const descRes = await axios.post(`${API_URL}/describe-visual`, {
        prompt: sampleText,
      });
      const description = descRes.data.description;

      const svgRes = await axios.post(`${API_URL}/generate-svg`, {
        description,
      });
      const svg = svgRes.data.svg;

      setVisuals([{ description, svg }]);
      setShowDescription(false);
    } catch (err) {
      setError("Something went wrong while generating the visual. 😓");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] px-6 py-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          <h1 className="text-4xl font-extrabold mb-2">
            <span className="text-white">Generate </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">
              Visuals
            </span>
          </h1>

          <p className="text-purple-300">
            Enter a short prompt like "Free body diagram of a pendulum" and get a structured SVG output with labels!
          </p>

          <textarea
            className="w-full p-4 rounded-xl bg-white/10 border border-purple-500 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows={5}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Enter a visual concept..."
          />

          <button
            className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 hover:brightness-110 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-all"
            onClick={handleGenerate}
            disabled={loading || !sampleText.trim()}
          >
            {loading ? "Summoning SVG magic..." : "Generate"}
          </button>

          {error && (
            <div className="text-red-500 font-semibold bg-red-100/10 border border-red-400 p-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-6">
          {loading && (
            <div className="bg-purple-100 bg-opacity-10 border border-purple-500 p-6 rounded-xl shadow text-center animate-pulse text-purple-300">
              🍳 Cooking up some SVG magic for you...
            </div>
          )}

          {!loading && visuals.map((v, i) => (
            <div
              key={i}
              className="bg-white/10 border border-purple-600 p-6 rounded-2xl shadow hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-purple-200">
                  Diagram
                </h2>
                <button
                  className="text-sm text-purple-400 underline hover:text-purple-200"
                  onClick={() => setShowDescription((prev) => !prev)}
                >
                  {showDescription ? "Hide Notes" : "Reveal Genius Behind This"}
                </button>
              </div>
              {showDescription && (
                <p className="text-sm text-purple-200 italic mb-4">
                  {v.description}
                </p>
              )}
              <div
                className="bg-white rounded-md overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: v.svg }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
