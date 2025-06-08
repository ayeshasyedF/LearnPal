"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const API_URL = "http://localhost:8000";

const colorBg =
  "bg-gradient-to-br from-purple-200 via-purple-300 to-purple-600 min-h-screen";
const panelBg = "bg-white bg-opacity-70 rounded-2xl shadow-2xl p-8";

export default function Page() {
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState({});
  const [topics, setTopics] = useState([]);
  const [checkedTopics, setCheckedTopics] = useState([]);
  const [customSyllabus, setCustomSyllabus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/courses`)
      .then((res) => setCourses(res.data))
      .catch(() =>
        setError("Could not load courses, did you start the backend?")
      );
  }, []);

  useEffect(() => {
    if (faculty && courses[faculty]) {
      setCourse("");
      setTopics([]);
      setCheckedTopics([]);
    }
  }, [faculty]);

  useEffect(() => {
    if (faculty && course) {
      const obj = courses[faculty]?.find((c) => c.name === course);
      setTopics(obj ? obj.topics : []);
      setCheckedTopics([]);
    }
  }, [course, faculty, courses]);

  const handleCheckbox = (topic) => {
    setCheckedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setError("");
    try {
      const res = await axios.post(`${API_URL}/generate`, {
        faculty,
        course,
        topics: checkedTopics.length ? checkedTopics : topics,
        custom_syllabus: customSyllabus,
      });
      setResult(res.data.result);
    } catch (err) {
      setError("Bruh. Something broke. Try again?");
    }
    setLoading(false);
  };

  return (
    <div
      className={
        colorBg + " flex flex-col items-center justify-center py-12"
      }
    >
      <div className={panelBg + " max-w-2xl w-full"}>
        <h1 className="text-4xl font-black text-purple-800 mb-2 tracking-tight drop-shadow-lg">
          LearnPal 😛
        </h1>
        <div className="mb-4 text-md font-medium text-purple-700 italic">
          Your AI Meme Lord TA, here to roast you into passing.
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Faculty Dropdown */}
          <div>
            <label className="font-bold text-purple-700">
              Pick your engineering type
            </label>
            <select
              className="w-full mt-1 rounded-xl border border-purple-300 p-2 focus:ring-2 focus:ring-purple-400"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              required
            >
              <option value="">-- Choose Faculty --</option>
              {Object.keys(courses).map((fac) => (
                <option key={fac} value={fac}>
                  {fac.charAt(0).toUpperCase() + fac.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {/* Course Dropdown */}
          {faculty && (
            <div>
              <label className="font-bold text-purple-700">
                Pick your course
              </label>
              <select
                className="w-full mt-1 rounded-xl border border-purple-300 p-2 focus:ring-2 focus:ring-purple-400"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              >
                <option value="">-- Choose Course --</option>
                {courses[faculty]?.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Topic Selection */}
          {faculty && course && topics.length > 0 && (
            <div>
              <label className="font-bold text-purple-700">
                Topics to roast (leave empty for all):
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {topics.map((t) => (
                  <label
                    key={t}
                    className="bg-purple-100 px-3 py-1 rounded-xl text-sm flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="accent-purple-500 mr-2"
                      checked={checkedTopics.includes(t)}
                      onChange={() => handleCheckbox(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Custom Syllabus */}
          <div>
            <label className="font-bold text-purple-700">
              Paste your own syllabus (optional)
            </label>
            <textarea
              className="w-full mt-1 rounded-xl border border-purple-300 p-2 focus:ring-2 focus:ring-purple-400 min-h-[80px]"
              placeholder="Copy-paste your prof's cryptic syllabus here if you want even more targeted roasting."
              value={customSyllabus}
              onChange={(e) => setCustomSyllabus(e.target.value)}
            />
          </div>
          <button
            className="mt-4 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:scale-105 hover:bg-purple-800 transition-all text-lg"
            disabled={loading || !faculty || !course}
            type="submit"
          >
            {loading ? "Summoning meme lord..." : "Cram Me"}
          </button>
        </form>
        {error && (
          <div className="mt-4 text-pink-700 bg-pink-100 p-3 rounded-xl text-center font-bold border border-pink-200">
            {error}
          </div>
        )}
        
        {result && (
  <div className="mt-8 p-6 bg-purple-100 rounded-2xl shadow-inner border-l-4 border-purple-500 animate-fade-in">
    <h2 className="text-2xl font-bold mb-2 text-purple-800">
      🔥 Meme Lord TA's Roast 🔥
    </h2>
    <div className="prose prose-purple max-w-full text-purple-900">
      <ReactMarkdown
        children={result}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      />
    </div>
  </div>
)}

      </div>
      <div className="mt-12 text-sm text-purple-300 opacity-60">
        Built for engineering panic. No refunds.
      </div>
    </div>
  );
}
