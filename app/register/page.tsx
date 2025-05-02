"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative flex h-screen justify-center items-center bg-cover bg-center w-full px-4" style={{ backgroundImage: "url('/maxresdefault.jpg') " }}>
      <div className="p-8 bg-white shadow-2xl rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Create Account</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition "
          style={{ fontFamily: "Geomanist, sans-serif" }}
        >
          Create Account
        </button>
        <p className="text-center mt-4 text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
