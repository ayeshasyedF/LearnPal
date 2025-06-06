'use client';
import { useEffect, useState } from 'react';

export default function SummaryPage() {
  const [outline, setOutline] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('outline');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      let content = parsed?.outline;
      // Clean and parse JSON string if needed
      if (typeof content === 'string') {
        content = content.trim().replace(/^```(json)?/i, '').replace(/```$/, '');
        content = JSON.parse(content);
      }
      setOutline(content);
    } catch {
      setOutline({ error: "Could not parse outline" });
    }
  }, []);

  if (!outline) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center text-purple-600">
        <h2 className="text-2xl font-semibold mb-3">Your outline will appear here!</h2>
      </div>
    );
  }

  if (outline.error) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-red-700">
        <h2 className="text-xl font-bold mb-3">Error</h2>
        <p>{outline.error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-purple-50 rounded-xl shadow">
      <h1 className="text-4xl font-extrabold text-purple-900 mb-2">{outline.main_topic}</h1>
      <p className="mb-6 text-purple-800 italic">{outline.overview}</p>
      <h2 className="text-2xl font-bold text-purple-700 mb-2">Major Topics</h2>
      <ul className="list-disc pl-8 text-lg text-purple-900 space-y-2">
        {outline.topics?.map((topic, i) => (
          <li key={i}>{topic}</li>
        ))}
      </ul>
    </div>
  );
}
