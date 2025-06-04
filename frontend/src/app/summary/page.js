'use client';
import { useEffect, useState } from 'react';

export default function SummaryPage() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('summary');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSummary(parsed);
        } else if (parsed.summary && Array.isArray(parsed.summary)) {
          setSummary(parsed.summary);
        } else if (typeof parsed === 'string') {
          setSummary([{ title: 'Summary', summary: parsed }]);
        } else {
          setSummary([{ title: 'Summary', summary: 'Invalid format' }]);
        }

      } catch (e) {
        console.error("Parse error:", e);
        setSummary([{ title: 'Error', summary: 'Could not load summary' }]);
      }
    }
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Teaching Summary</h1>
      {summary.map((block, index) => (
        <div key={index} className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="font-bold text-xl">{block.title}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{block.summary}</p>
        </div>
      ))}
    </div>
  );
}
