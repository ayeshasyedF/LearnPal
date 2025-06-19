"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "http://localhost:8000";

const gradientText =
  "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400";

export default function Page() {
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState({});
  const [topics, setTopics] = useState([]);
  const [checkedTopics, setCheckedTopics] = useState([]);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) router.push("/login");
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/courses`)
      .then((res) => setCourses(res.data))
      .catch(() => setError("Could not load courses, did you start the backend?"));
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
    setCheckedTopics([topic]);
  };

  const handleRedirect = async (e) => {
    e.preventDefault();

    const selectedTopic =
      checkedTopics.length > 0 ? checkedTopics[0] : topics[0] || "basic engineering principles";

    try {
      const res = await axios.post(`${API_URL}/roast-explain`, {
        course,
        topic: selectedTopic,
      });

      const roast = res.data.roast || "No roast generated. Your brain must be fireproof.";

      router.push(
        `/burn-my-brain?roast=${encodeURIComponent(roast)}&courseName=${encodeURIComponent(
          course
        )}&topic=${encodeURIComponent(selectedTopic)}`
      );
    } catch (err) {
      setError("🔥 Failed to roast your brain. Check your backend.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-20 pb-12 font-[Inter]">
      {/* Header Intro */}
      <div className="text-center mb-14">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
          Welcome to <span className={gradientText}>ShrEdu</span>
        </h1>
        <p className="text-purple-300 text-md md:text-lg max-w-xl mx-auto">
          Your AI Meme-Lord TA, roasting your brain into understanding engineering.
        </p>
      </div>

      {/* Roast Generator */}
      <div className="max-w-2xl mx-auto bg-white/10 p-8 rounded-2xl shadow border border-white/10">
        <form onSubmit={handleRedirect} className="flex flex-col gap-6">
          <div>
            <label className="block font-semibold text-purple-300 mb-1">
              Pick your engineering type
            </label>
            <select
              className="w-full rounded-xl border border-purple-300 bg-white text-black p-3"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              required
            >
              <option value="">-- Choose Faculty --</option>
              {Object.entries(courses)
                .filter(([key, value]) => key.trim() !== "" && Array.isArray(value))
                .map(([fac]) => (
                  <option key={fac} value={fac} className="text-black">
                    {fac.charAt(0).toUpperCase() + fac.slice(1)}
                  </option>
                ))}
            </select>
          </div>

          {faculty && (
            <div>
              <label className="block font-semibold text-purple-300 mb-1">
                Pick your course
              </label>
              <select
                className="w-full rounded-xl border border-purple-300 bg-white text-black p-3"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              >
                <option value="">-- Choose Course --</option>
                {courses[faculty]?.map((c) => (
                  <option key={c.name} value={c.name} className="text-black">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {faculty && course && topics.length > 0 && (
            <div>
              <label className="block font-semibold text-purple-300 mb-1">
                Pick one topic to roast:
              </label>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <label
                    key={t}
                    className={`px-3 py-2 rounded-lg cursor-pointer text-sm border border-purple-500 ${
                      checkedTopics.includes(t)
                        ? "bg-purple-700 text-white"
                        : "bg-purple-800/30 text-purple-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="topic"
                      className="hidden"
                      checked={checkedTopics.includes(t)}
                      onChange={() => handleCheckbox(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-950 via-purple-800 to-purple-900 hover:brightness-110 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:scale-105 transition-all"
            disabled={!faculty || !course || !checkedTopics.length}
          >
            Roast Me 
          </button>

          {error && <div className="text-red-300 font-semibold">{error}</div>}
        </form>
      </div>
    </div>
  );
}
