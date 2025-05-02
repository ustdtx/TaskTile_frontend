"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div
      className="relative flex h-screen justify-center items-center bg-cover bg-center w-full px-4"
      style={{ backgroundImage: "url('/maxresdefault.jpg')" }}
    >
      <div ></div>
      <div className="text-center text-white relative z-10">
        <h1
          className="text-6xl font-bold mb-6"
          style={{ fontFamily: "Geomanist, sans-serif" }}
        >
          TaskTile
        </h1>
        <p className="text-xl font-light mb-8">
          A task management system for your personal and group projects.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="bg-white text-blue-600 py-3 px-6 rounded-lg shadow-md hover:bg-blue-200 transition font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  );
}
