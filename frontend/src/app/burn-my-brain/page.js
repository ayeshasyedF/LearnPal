"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BurnMyBrain() {
  const router = useRouter();
  const [roast, setRoast] = useState("");
  const [courseName, setCourseName] = useState("");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    if (router.isReady) {
      const { roast, courseName, topic } = router.query;
      if (roast && courseName && topic) {
        setRoast(roast);
        setCourseName(courseName);
        setTopic(topic);
      }
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-300 to-purple-600 flex flex-col items-center justify-center text-center p-12">
      <h1 className="text-5xl font-black text-purple-800 mb-4">🔥 Burn My Brain 🔥</h1>
      <p className="text-xl text-purple-700 mb-2">
        Here’s your savage breakdown of <b>{topic}</b> in <b>{courseName}</b>:
      </p>
      <div className="text-xl text-red-600 font-bold mb-6 whitespace-pre-line">{roast}</div>
      <a
        href="/"
        className="bg-white text-purple-600 font-bold py-2 px-6 rounded-xl shadow hover:scale-105 transition-all"
      >
        Go Back
      </a>
    </div>
  );
}
