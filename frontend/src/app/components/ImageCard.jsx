"use client";
import React from "react";

export default function ImageCard({ description, svg }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mt-4 border border-purple-200">
      <p className="font-semibold text-purple-700 mb-2">
        🖼️ {description}
      </p>
      {svg ? (
        <div
          className="border rounded-lg p-2 bg-purple-50"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <p className="italic text-sm text-purple-400">No SVG provided.</p>
      )}
    </div>
  );
}
