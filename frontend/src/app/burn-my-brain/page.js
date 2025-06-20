"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import axios from "axios";

const API_URL = "http://localhost:8000";

export default function BurnMyBrain() {
  const searchParams = useSearchParams();
  const [roast, setRoast] = useState("");
  const [courseName, setCourseName] = useState("");
  const [topic, setTopic] = useState("");
  const [sections, setSections] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const roastParam = searchParams.get("roast");
    const courseParam = searchParams.get("courseName");
    const topicParam = searchParams.get("topic");

    if (roastParam && courseParam && topicParam) {
      const decoded = decodeURIComponent(roastParam);
      setRoast(decoded);
      setCourseName(courseParam);
      setTopic(topicParam);

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

      axios
        .get(`${API_URL}/epic-resources`)
        .then((res) => {
          const filtered = res.data.filter((r) => r.tags?.toLowerCase().includes(topicParam.toLowerCase()));
          const sorted = filtered.sort((a, b) => b.avg_rating - a.avg_rating);
          setResources(sorted);
        })
        .catch(() => setResources([]));
    }
  }, [searchParams]);

  const saveRoast = () => {
    const blob = new Blob([roast], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${topic}_roast.txt`;
    link.click();
  };

  const getYouTubeEmbedUrl = (url) => {
    try {
      const yt = new URL(url);
      const id = yt.hostname === "youtu.be" ? yt.pathname.slice(1) : yt.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-purple-300 px-4 py-20 flex flex-col items-center font-[Inter]">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-2">
        <span className="text-white">Burn Your Panda </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">Brain</span>
      </h1>
      <p className="text-lg text-purple-400 mb-6 text-center max-w-3xl">
        Here’s your aggressively helpful roast about <b>{topic}</b> in <b>{courseName}</b>:
      </p>

      {roast && (
        <button
          onClick={saveRoast}
          className="mb-6 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg transition"
        >
          Save Roast
        </button>
      )}

      <div className="w-full max-w-4xl space-y-4">
        {sections.map(({ heading, body, id }) => (
          <details key={id} className="bg-zinc-900 border border-purple-700 rounded-xl shadow-lg p-4" open={id === 0}>
            <summary className="cursor-pointer text-lg font-bold text-purple-300">
  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
    {heading}
  </ReactMarkdown>
</summary>

            <div className="prose prose-purple prose-invert mt-2">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{body}</ReactMarkdown>
            </div>
          </details>
        ))}
      </div>

      <div className="w-full max-w-4xl mt-12">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Top-Rated Help for <span className="text-purple-200">{topic}</span></h2>
        {resources.length === 0 ? (
          <div className="text-purple-400 italic text-center">No community wisdom... yet! Be the first to upload a resource and save some souls 😇</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {resources.map((r) => {
              const isYouTube = getYouTubeEmbedUrl(r.url);
              const tagList = r.tags?.split(",").map((t) => t.trim()).filter(Boolean);
              const isImage = r.type?.startsWith("image") && r.url && !isYouTube;
              const isVideo = r.type?.startsWith("video") && r.url && !isYouTube;
              const imageUrl = r.url?.startsWith("http") ? r.url : `${API_URL}/uploads/${encodeURIComponent(r.url.split("/").pop())}`;

              return (
                <div key={r.id} className="bg-white/10 border border-purple-600 p-5 rounded-2xl shadow hover:shadow-xl transition">
                  <h3 className="text-lg font-bold text-white mb-1">{r.title}</h3>
                  <p className="text-purple-300 text-sm mb-2">by <i>{r.submitted_by}</i></p>

                  {r.type === "link" && !isYouTube && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="block text-blue-300 underline truncate mb-2">{r.url}</a>
                  )}

                  {isYouTube && (
                    <div className="aspect-video mb-2">
                      <iframe
                        src={isYouTube}
                        title={r.title}
                        className="w-full h-full rounded-xl border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {isImage && (
                    <img
                      src={imageUrl}
                      onError={(e) => (e.currentTarget.src = "/fallback-image.svg")}
                      alt={r.title}
                      className="rounded-lg max-h-48 object-cover mb-2 w-full"
                    />
                  )}

                  {isVideo && (
                    <video
                      src={imageUrl}
                      controls
                      className="rounded-lg max-h-48 mb-2 w-full"
                    />
                  )}

                  <div className="mt-2 text-sm text-yellow-300 font-semibold">
                    Avg. Rating: ⭐ {r.avg_rating?.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
