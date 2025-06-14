"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "http://localhost:8000";

const colorBg =
  "bg-gradient-to-br from-purple-200 via-purple-300 to-purple-600 min-h-screen";
const panelBg = "bg-white bg-opacity-70 rounded-2xl shadow-2xl p-8";

export default function Page() {

  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState({});
  const [topics, setTopics] = useState([]);
  const [checkedTopics, setCheckedTopics] = useState([]);
  const [customSyllabus, setCustomSyllabus] = useState("");
  const [error, setError] = useState("");
  const [roast, setRoast] = useState(""); // State to hold the roast for the selected course

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
      setRoast(""); // Reset roast when faculty changes
    }
  }, [faculty]);

  useEffect(() => {
    if (faculty && course) {
      const obj = courses[faculty]?.find((c) => c.name === course);
      setTopics(obj ? obj.topics : []);
      setCheckedTopics([]);

      // Set the roast based on the selected course
      setRoast(obj ? obj.roast : "");
    }
  }, [course, faculty, courses]);

  const handleCheckbox = (topic) => {
    setCheckedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };
const handleRedirect = async (e) => {
  e.preventDefault();
  if (!faculty || !course || !selectedTopic) return;
  setLoading(true);
  try {
    const res = await axios.post(`${API_URL}/roast-explain`, {
      course,
      topic: selectedTopic,
    });
    const roast = res.data.roast;
    const queryParams = new URLSearchParams({ roast, courseName: course, topic: selectedTopic });
    router.push(`/burn-my-brain?${queryParams.toString()}`);
  } catch (err) {
    setError("Failed to get roast from AI.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={colorBg + " flex flex-col items-center justify-center py-12"}>
      <div className={panelBg + " max-w-2xl w-full"}>
        <h1 className="text-4xl font-black text-purple-800 mb-2 tracking-tight drop-shadow-lg">
          LearnPal 😛
        </h1>
        <div className="mb-4 text-md font-medium text-purple-700 italic">
          Your AI Meme Lord TA, here to roast you into passing.
        </div>

        <form onSubmit={handleRedirect}>
          <div>
            <label className="font-bold text-purple-700">Pick your engineering type</label>
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

          {faculty && (
            <div>
              <label className="font-bold text-purple-700">Pick your course</label>
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
{faculty && course && topics.length > 0 && (
    <div>
      <label className="font-bold text-purple-700">
        Pick a topic to be roasted:
      </label>
      <select
        className="w-full mt-1 rounded-xl border border-purple-300 p-2 focus:ring-2 focus:ring-purple-400"
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
        required
      >
        <option value="">-- Choose Topic --</option>
        {topics.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  )}
         <button
  className="mt-4 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:scale-105 hover:bg-purple-800 transition-all text-lg"
  type="submit"
  disabled={!faculty || !course || !selectedTopic || loading}
>
  {loading ? "Roasting..." : "Cram Me"}
</button>
        </form>

        {error && <div>{error}</div>}
      </div>
    </div>
  );
}
