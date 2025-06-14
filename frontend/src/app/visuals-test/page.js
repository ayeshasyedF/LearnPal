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
    <div
      className="p-8 min-h-screen"
      style={{
        background: "linear-gradient(to bottom right, #130411, #2c1846, #764aa0, #dcccf0, #a158b2)",
      }}
    >
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <h1
            className="text-3xl drop-shadow-lg"
            style={{
              fontFamily: "'Broadway', sans-serif",
              color: "#dcccf0",
            }}
          >
            Test Visualization
          </h1>

          <textarea
            className="w-full p-4 rounded-xl border border-purple-300 focus:ring-2 focus:ring-purple-400 shadow"
            rows={5}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Enter a short visual cue like 'free-body diagram of a pendulum'..."
          />

          <button
            className="text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 hover:brightness-110 transition-transform duration-300 ease-in-out"
            style={{
              background: "linear-gradient(to right, #a158b2, #764aa0, #2c1846)",
              fontFamily: "'Broadway', sans-serif",
            }}
            onClick={handleGenerate}
            disabled={loading || !sampleText.trim()}
          >
            {loading ? "Summoning SVG magic..." : "✨ Generate Visual ✨"}
          </button>

          {error && (
            <div className="text-red-600 font-semibold bg-red-100 p-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        <div className="w-px bg-purple-200 hidden md:block" />

        <div className="flex flex-col gap-6 w-full md:w-1/2">
          {loading && (
            <div className="bg-purple-100 bg-opacity-50 p-6 rounded-xl shadow-md text-center animate-pulse text-purple-800 font-semibold">
              🍳 Cooking up some SVG magic for you...
            </div>
          )}

          {!loading && visuals.map((v, i) => (
            <div
              key={i}
              className="bg-white bg-opacity-80 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h2
                  className="text-xl text-purple-700"
                  style={{ fontFamily: "'Broadway', sans-serif" }}
                >
                  Diagram
                </h2>
                <button
                  className="text-sm text-purple-600 underline hover:text-purple-800"
                  onClick={() => setShowDescription((prev) => !prev)}
                >
                  {showDescription ? "Hide Notes" : "Reveal Genius Behind This"}
                </button>
              </div>
              {showDescription && (
                <p className="text-gray-700 text-sm italic mb-4 transition-opacity">
                  {v.description}
                </p>
              )}
              <div dangerouslySetInnerHTML={{ __html: v.svg }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
