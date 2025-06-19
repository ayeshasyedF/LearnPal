"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "http://localhost:8000";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      localStorage.setItem("user", JSON.stringify({ username: res.data.username, role: res.data.role }));
      localStorage.setItem("authToken", res.data.token);
      router.push("/home");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] px-4 py-20 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-lg w-full max-w-md border border-purple-600">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          <span className="text-white">Login, you </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">
            Panda
          </span>
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 rounded-xl bg-white/10 border border-purple-500 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-xl bg-white/10 border border-purple-500 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 hover:brightness-110 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-all"
          >
            Login
          </button>

          {error && <p className="text-red-300 text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
