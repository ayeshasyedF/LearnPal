'use client';
import { useEffect, useState } from 'react';

export default function SummaryPage() {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('outline');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setSummary(parsed.outline || '');
    } catch {
      setSummary('');
    }
  }, []);

  if (!summary) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center text-purple-600">
        <h2 className="text-2xl font-semibold mb-3">Your summary will appear here!</h2>
        <p className="text-purple-400">Upload a PDF and let the Cheeky TA work its magic ✨</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-purple-50 rounded-xl shadow">
      <h1 className="text-3xl font-extrabold text-purple-900 mb-4">Cheeky TA’s Study Sheet</h1>
      <pre className="whitespace-pre-wrap text-lg text-purple-900 bg-white p-6 rounded shadow-inner">{summary}</pre>
    </div>
  );
}
