'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:8000/outline/', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    localStorage.setItem('outline', JSON.stringify(data));
    router.push('/summary');
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-extrabold mb-4 text-purple-800">LearnPal: Outline Generator</h1>
      <input type="file" className="mb-3" onChange={(e) => setFile(e.target.files[0])} />
      <button
        onClick={handleUpload}
        className="mt-2 px-5 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 shadow"
      >
        Generate Outline
      </button>
    </div>
  );
}
