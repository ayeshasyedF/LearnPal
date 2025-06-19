"use client";
import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

const UploadPage = () => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("link");
  const [submittedBy, setSubmittedBy] = useState("");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("submitted_by", submittedBy);
    formData.append("tags", tags);
    formData.append("url", url);
    if (file) formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/upload-resource`, formData);
      setMessage("✅ Uploaded successfully! ID: " + res.data.id);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Try again");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] px-4 py-20 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg border border-purple-600 p-8 rounded-3xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          <span className="text-white">Upload </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">Epic</span>
          <span className="text-white"> Resource</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          <input
            type="text"
            placeholder="Title (e.g. Best W Diagram Ever)"
            className="p-3 rounded-xl bg-white/10 border border-purple-400 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <select
            className="p-3 rounded-xl bg-white text-black border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="link">Link</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>

          <input
            type="text"
            placeholder="Your name / username"
            className="p-3 rounded-xl bg-white/10 border border-purple-400 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Tags (comma separated)"
            className="p-3 rounded-xl bg-white/10 border border-purple-400 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <input
            type="url"
            placeholder="Link (if applicable)"
            className="p-3 rounded-xl bg-white/10 border border-purple-400 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,video/*"
            className="p-2 rounded-xl bg-white/10 border border-purple-400 text-white"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            type="submit"
            className="mt-4 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 hover:brightness-110 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-all"
          >
            Upload 
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center font-semibold text-purple-300">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
