"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function viewPage() {
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

  useEffect(() => {
    const checkProjectRole = async () => {
      if (!userId) return;

      const projectId = window.location.pathname.split("/")[2]; // Extract project ID from the URL
      try {
        const response = await fetch(`http://localhost:3001/projects/${projectId}/members`, {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const members = await response.json();
        const currentUser = members.find((member: any) => member.user.id === userId);

        if (currentUser) {
          if (currentUser.isManager) {
            router.push(`/projects/${projectId}/Manager`);
          } else {
            router.push(`/projects/${projectId}/Member`);
          }
        } else {
          alert("You are not a member of this project.");
          router.push("/projects");
        }
      } catch (error) {
        console.error("Error fetching project members:", error);
        router.push("/projects");
      }
    };

    if (isAuthenticated) {
      checkProjectRole();
    }
  }, [isAuthenticated, userId, router]);

  if (isAuthenticated === null) return <p>Loading...</p>;

  return null; // No UI is needed since the user will be redirected
}

