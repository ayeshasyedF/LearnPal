"use client";
import { useEffect, useState } from "react";

export default function SummaryPage() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("summaryData");
    if (stored) setSummary(JSON.parse(stored));
  }, []);

  return (
    <main className="p-8 min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Summary</h1>
        {summary.length === 0 ? (
          <p className="text-center text-gray-600">No summary available.</p>
        ) : (
          summary.map((item, idx) => (
            <div key={idx} className="p-4 bg-white rounded shadow">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-gray-700">{item.summary}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
