// FILE: frontend/src/app/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "http://localhost:8000";

const colorBg =
  "bg-gradient-to-br from-[#0a0014] via-[#1a002d] to-[#3b1c6b] min-h-screen text-white";
const panelBg = "bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10 text-white";

export default function Page() {
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState({});
  const [topics, setTopics] = useState([]);
  const [checkedTopics, setCheckedTopics] = useState([]);
  const [customSyllabus, setCustomSyllabus] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

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

  const handleRedirect = (e) => {
    e.preventDefault();
    router.push("/burn-my-brain");
  };

  return (
    <div className={colorBg + " flex flex-col items-center justify-center py-12"}>
      <div className={panelBg + " max-w-2xl w-full"}>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
          ShrEdu
        </h1>
        <div className="mb-4 text-md font-medium text-purple-300 italic">
          Your AI Meme Lord TA, here to roast you into passing.
        </div>

        <form onSubmit={handleRedirect} className="flex flex-col gap-4">
          <div>
            <label className="font-bold text-purple-300">
              Pick your engineering type
            </label>
            <div className="relative mt-1">
              <select
                className="w-full rounded-xl border border-purple-300 bg-white text-gray-900 p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-md transition-all"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                required
              >
                <option value="">-- Choose Faculty --</option>
                {Object.keys(courses).map((fac) => (
                  <option key={fac} value={fac} className="text-black">
                    {fac.charAt(0).toUpperCase() + fac.slice(1)}
                  </option>
                ))}
              </select>
              
            </div>
          </div>

          {faculty && (
            <div>
              <label className="font-bold text-purple-300">
                Pick your course
              </label>
              <div className="relative mt-1">
                <select
                  className="w-full rounded-xl border border-purple-300 bg-white text-gray-900 p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-md transition-all"
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
            </div>
          )}

          {faculty && course && topics.length > 0 && (
            <div>
              <label className="font-bold text-purple-300">
                Topics to roast (leave empty for all):
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {topics.map((t) => (
                  <label
                    key={t}
                    className="bg-purple-800/40 px-3 py-1 rounded-xl text-sm flex items-center cursor-pointer border border-purple-500"
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

          <div>
            <label className="font-bold text-purple-300">
              Paste your own syllabus (optional)
            </label>
            <textarea
              className="w-full mt-1 rounded-xl border border-purple-500 bg-white/10 text-white placeholder-purple-300 p-2 focus:ring-2 focus:ring-purple-600 min-h-[80px]"
              placeholder="Copy-paste your prof's cryptic syllabus here if you want even more targeted roasting."
              value={customSyllabus}
              onChange={(e) => setCustomSyllabus(e.target.value)}
            />
          </div>

          <button
            className="mt-4 bg-gradient-to-r from-purple-500 via-purple-700 to-purple-800 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:scale-110 hover:brightness-110 transition-all text-lg"
            type="submit"
            disabled={!faculty || !course}
          >
            GO
          </button>
        </form>

        {error && (
          <div className="mt-4 text-pink-300 bg-pink-900 bg-opacity-20 border border-pink-500/50 p-3 rounded-xl text-center font-bold">
            {error}
          </div>
        )}
      </div>

      <div className="mt-12 text-sm text-purple-300 opacity-60">
        Built for engineering panic. No refunds.
      </div>
    </div>
  );
}
