"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }
      
      if (response.ok) {
        localStorage.setItem("token", data.token);
      }
      // Redirect based on user role
      if (data.role === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="relative flex h-screen justify-center items-center bg-cover bg-center w-full px-4"
      style={{ backgroundImage: "url('/maxresdefault.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50 hidden"></div>

      {/* Login Box */}
      <div className="relative z-10 p-8 bg-white shadow-2xl rounded-lg w-full max-w-md">
        <h1
          className="text-3xl font-extrabold text-center mb-6 text-gray-800"
          style={{ fontFamily: "Geomanist, sans-serif" }}
        >
          Login
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
        >
          Login
        </button>
        <p className="text-center mt-4 text-gray-600">
          Not a user?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
}
