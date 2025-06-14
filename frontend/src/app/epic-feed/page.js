"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

const EpicFeed = () => {
  const [resources, setResources] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("isAdmin") === "true" || JSON.parse(localStorage.getItem("user"))?.role === "admin");
    fetchResources();
  }, []);

  const fetchResources = () => {
    axios
      .get(`${API_URL}/epic-resources`)
      .then((res) => setResources(res.data))
      .catch((err) => console.error("Error fetching resources:", err));
  };

  const handleAdminAction = async (id) => {
    const confirmed = window.confirm("You're about to perform an ADMIN action. Proceed?");
    if (!confirmed) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Missing token. Please login again.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/delete-resource/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchResources();
    } catch (err) {
      alert("Failed to perform admin action. Invalid token?");
      console.error(err);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a002d] via-purple-900 to-indigo-900 p-6 text-white font-[Inter]">
      <h1 className="text-4xl font-[Broadway] text-white text-center mb-8">
         EPIC Resources 
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {resources.map((r) => {
          const isYouTube = getYouTubeEmbedUrl(r.url);

          return (
            <div
              key={r.id}
              className="relative bg-white/10 p-5 rounded-2xl shadow-md backdrop-blur-sm border border-white/20 hover:scale-105 transition-all"
            >
              {isAdmin && (
                <button
                  onClick={() => handleAdminAction(r.id)}
                  className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-xl hover:bg-red-700"
                >
                  A
                </button>
              )}

              <h2 className="text-xl font-semibold mb-1">{r.title}</h2>
              <p className="text-purple-200 text-sm mb-2">
                Uploaded by: <span className="italic">{r.submitted_by}</span>
              </p>

              {r.type === "link" && !isYouTube && (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-300 underline truncate mb-2"
                >
                  {r.url}
                </a>
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

              {(r.type === "image" && !isYouTube) && (
                <img
                  src={`http://localhost:8000/${r.url}`}
                  alt={r.title}
                  className="rounded-lg max-h-48 object-cover mb-2"
                />
              )}

              {(r.type === "video" && !isYouTube) && (
                <video
                  src={`http://localhost:8000/${r.url}`}
                  controls
                  className="rounded-lg max-h-48 mb-2"
                />
              )}

              <p className="text-sm text-purple-300 italic mb-1">Tags: {r.tags}</p>
              <p className="text-sm text-yellow-300 font-bold">
                Avg. Rating: ⭐ {r.avg_rating?.toFixed(1)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpicFeed;
