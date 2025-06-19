"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function BurnMyBrain() {
  const searchParams = useSearchParams();
  const [roast, setRoast] = useState("");
  const [courseName, setCourseName] = useState("");
  const [topic, setTopic] = useState("");
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const roastParam = searchParams.get("roast");
    const courseParam = searchParams.get("courseName");
    const topicParam = searchParams.get("topic");

    if (roastParam && courseParam && topicParam) {
      const decoded = decodeURIComponent(roastParam);
      setRoast(decoded);
      setCourseName(courseParam);
      setTopic(topicParam);

      // 🪄 Try splitting by multiple fallback formats
      let split = decoded.split(/####\s+/).filter(Boolean);
      if (split.length < 2) split = decoded.split(/###\s+/).filter(Boolean);
      if (split.length < 2) split = decoded.split(/\n(?=\d+\.\s+\*\*)/).filter(Boolean);

      const sectioned = split.map((block, i) => {
        const lines = block.trim().split("\n");
        const heading = lines[0].trim();
        const body = lines.slice(1).join("\n").trim();
        return {
          heading: heading || (i === 0 ? "🔥 Introduction" : `Section ${i + 1}`),
          body,
          id: i,
        };
      });

      setSections(sectioned);
    }
  }, [searchParams]);

  const saveRoast = () => {
    const blob = new Blob([roast], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${topic}_roast.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-purple-300 px-4 py-10 flex flex-col items-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-purple-500 mb-2">
         Burn My Brain 
      </h1>
      <p className="text-lg text-purple-400 mb-6 text-center max-w-3xl">
        Here’s your aggressively helpful roast about <b>{topic}</b> in{" "}
        <b>{courseName}</b>:
      </p>

      {roast && (
        <button
          onClick={saveRoast}
          className="mb-6 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg transition"
        >
          Save This Roast 💾
        </button>
      )}

      <div className="w-full max-w-4xl space-y-4">
        {sections.map(({ heading, body, id }) => (
          <details
            key={id}
            className="bg-zinc-900 border border-purple-700 rounded-xl shadow-lg p-4"
            open={id === 0}
          >
            <summary className="cursor-pointer text-lg font-bold text-purple-300">
              {heading}
            </summary>
            <div className="prose prose-purple prose-invert mt-2">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {body}
              </ReactMarkdown>
            </div>
          </details>
        ))}
      </div>

      <a
        href="/"
        className="mt-10 bg-purple-700 hover:bg-purple-600 transition px-6 py-3 text-white font-semibold rounded-full shadow-lg hover:scale-105"
      >
        Go Back
      </a>
    </div>
  );
}
