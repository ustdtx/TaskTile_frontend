'use client'

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  interface Project {
    id: string;
    title: string;
    description: string;
  }

  const [projects, setProjects] = useState<Project[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (response.ok) {
          setIsAuthenticated(true);
          setUserId(data.userId);
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // ✅ Fetch projects only when userId is available
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:3001/projects/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched projects:', data);
        if (Array.isArray(data)) {
          setProjects(data.map((pm: any) => pm.project));
        } else {
          console.error("Expected an array but got:", data);
        }
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
      });
  }, [userId]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Your Projects</h1>
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project: any) => (
            <li key={project.id} className="border p-2 rounded">
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
