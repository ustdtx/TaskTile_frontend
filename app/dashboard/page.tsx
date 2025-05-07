"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import ProfileModal from "../components/ProfileModal";
import AddTaskModal from "../components/AddTaskModal";
import TaskDetailsModal from "../components/TaskDetailsModal";
import Navbar from "../components/Navbar"; // Import the Navbar component

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const ButtonGrid = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 40px;
  gap: 40px;
  background-color: #f0f2f5;
`;

const DashboardButton = styled.div`
  width: 250px;
  height: 200px;
  background-color: white;
  border: 2px solid #0070f3;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e6f0ff;
    transform: scale(1.03);
  }
`;

const PlaceholderLogo = styled.div`
  width: 60px;
  height: 60px;
  background-color: #ccc;
  margin-bottom: 10px;
  border-radius: 8px;
`;

const ProjectImage = styled.img`
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
  border-radius: 8px;
`;

const Label = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;

  &:hover {
    background: darkred;
  }
`;

const ModalButton = styled.button`
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin: 10px 0;

  &:hover {
    background-color: #005bb5;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
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
  }, []);

  const handleCreateProject = async () => {
    try {
      const response = await fetch("http://localhost:3001/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          description: projectDescription,
        }),
      });

      if (response.ok) {
        alert("Project created successfully!");
        setIsCreateProjectModalOpen(false);
        setProjectTitle("");
        setProjectDescription("");
      } else {
        alert("Failed to create project.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <Navbar />

      <ButtonGrid>
        <DashboardButton onClick={() => setIsProjectModalOpen(true)}>
          <ProjectImage src="/Projects.png" alt="Projects Logo" />
          <Label>Projects</Label>
        </DashboardButton>

        <DashboardButton onClick={() => setIsTaskModalOpen(true)}>
          <PlaceholderLogo />
          <Label>Personal Tasks</Label>
        </DashboardButton>

        <DashboardButton onClick={() => setIsProfileModalOpen(true)}>
          <PlaceholderLogo />
          <Label>Profile</Label>
        </DashboardButton>
      </ButtonGrid>

      {isProjectModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setIsProjectModalOpen(false)}>X</CloseButton>
            <ModalButton
              onClick={() => {
                setIsCreateProjectModalOpen(true);
                setIsProjectModalOpen(false);
              }}
            >
              Create Project
            </ModalButton>
            <ModalButton onClick={() => router.push("/projects")}>Show Projects</ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {isCreateProjectModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setIsCreateProjectModalOpen(false)}>X</CloseButton>
            <h3>Create Project</h3>
            <Input
              type="text"
              placeholder="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
            <TextArea
              placeholder="Project Description (Optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
            <ModalButton onClick={handleCreateProject}>Create Project</ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {isTaskModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setIsTaskModalOpen(false)}>X</CloseButton>
            <ModalButton
              onClick={() => {
                setIsAddTaskModalOpen(true);
                setIsTaskModalOpen(false);
              }}
            >
              Add Task
            </ModalButton>
            <ModalButton onClick={() => router.push("/personalTasks")}>Show Tasks</ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {isAddTaskModalOpen && <AddTaskModal userId={userId || ""} onClose={() => setIsAddTaskModalOpen(false)} />}
      {isProfileModalOpen && user && <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} />}
    </Container>
  );
}
