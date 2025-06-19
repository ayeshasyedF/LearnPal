"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

const EpicFeed = () => {
  const [resources, setResources] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user"));
    setIsAdmin(user?.role === "admin");
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

  const handleRating = async (id, rating) => {
    const token = localStorage.getItem("authToken");
    if (!token) return alert("Login required to rate!");
    try {
      await axios.post(
        `${API_URL}/rate-resource`,
        new URLSearchParams({ resource_id: id, rating: rating.toString() }),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchResources();
    } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Rating failed. Try again");
      }
    }
  };

 const getYouTubeEmbedUrl = (url) => {
  try {
    const yt = new URL(url);
    const id =
      yt.hostname === "youtu.be"
        ? yt.pathname.slice(1)
        : yt.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
};

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] px-6 py-20">
      <h1 className="text-4xl font-extrabold text-center mb-10">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">Epic</span>
        <span className="text-white"> Resources</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {resources.map((r) => {
          const isYouTube = getYouTubeEmbedUrl(r.url);
          const tagList = r.tags?.split(",").map((t) => t.trim()).filter(Boolean);
          const isImage = r.type?.startsWith("image") && r.url && !isYouTube;
          const isVideo = r.type?.startsWith("video") && r.url && !isYouTube;
          const imageUrl = r.url?.startsWith("http")
  ? r.url
  : `${API_URL}/uploads/${encodeURIComponent(r.url.split("/").pop())}`;

          return (
            <div
              key={r.id}
              className="relative bg-white/10 p-5 rounded-2xl shadow-md backdrop-blur-sm border border-purple-600 hover:scale-105 transition-all"
            >
              {isAdmin && (
                <button
                  onClick={() => handleAdminAction(r.id)}
                  className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-xl hover:bg-red-700"
                >
                  A
                </button>
              )}

              <h2 className="text-xl font-semibold mb-1 text-white">{r.title}</h2>
              <p className="text-purple-300 text-sm mb-2">
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

              {isImage && (
                <img src={imageUrl} onError={(e) => e.currentTarget.src = "/fallback-image.svg"}
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

              <div className="mt-2">
  <a
    href={imageUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-blue-300 underline hover:text-blue-400"
  >
    🔗 View File
  </a>
</div>

              <div className="text-sm text-yellow-300 font-bold mb-2">
                Avg. Rating: ⭐ {r.avg_rating?.toFixed(1)}
              </div>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(r.id, star)}
                    className="text-yellow-400 text-xl hover:scale-110"
                    title={`Rate ${star}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpicFeed;
