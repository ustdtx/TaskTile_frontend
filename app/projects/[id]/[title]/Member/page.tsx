"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styled from "styled-components";
import AddTaskModal from "../../../../components/AddTaskModal";
import MemberTaskDetailsModal from "../../../../components/MemberTaskDetailsModal";
import Navbar from "../../../../components/Navbar";
const projectTitleRaw = window.location.pathname.split("/")[3];
const projectTitle = decodeURIComponent(projectTitleRaw); 

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
  background-color: #f0f2f5;
`;

const TaskList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
`;

const TaskItem = styled.div<{ backgroundColor: string }>`
  flex: 0 1 calc(33.333% - 20px);
  background-color: ${({ backgroundColor }) => backgroundColor};
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
  }

  p {
    margin: 5px 0;
    color: gray;
    font-size: 14px;
  }

  .deadline {
    font-size: 14px;
    font-weight: bold;
    margin-top: 10px;
  }
`;

export default function TasksPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<{ id: string; title: string; description: string; deadline: string; status: string; }[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(null);
  const [members, setMembers] = useState<{ id: string; username: string }[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];

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
          headers: { Authorization: `Bearer ${token}` }, // Correctly formatted headers
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
    const fetchMembers = async () => {
      try {
        const response = await fetch(`http://localhost:3001/projects/${projectId}/members`, {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await response.json();
        const filteredMembers = data.filter((member: any) => !member.isManager); // Exclude project managers
        setMembers(filteredMembers.map((member: any) => ({ id: member.user.id, username: member.user.username })));
        console.log(members);

      } catch (error) {
        console.error("Error fetching project members:", error);
      }
    };

    fetchMembers();
  }, [projectId]);

  useEffect(() => {
    const getProjectTasks = async () => {
      if (!projectId) return;
      try {
        const response = await fetch(`http://localhost:3001/project-tasks/project/${projectId}`);
        const data = await response.json();

        // Handle the response as an array of objects
        if (Array.isArray(data)) {

  if (Array.isArray(data)) {
    const mappedTasks = data
      .filter((task: any) => task.assigneeId === userId)
      .map((task: any) => ({
        id:          task.id,
        title:       task.title,
        description: task.description || "No description",
        deadline:    task.deadline    || "No deadline",
        status:      task.status      || "ONGOING",
    // no assigneeName at all
      }));
    setTasks(mappedTasks);
  }

        } else {
          console.error("Unexpected response format:", data);
          setTasks([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching project tasks:", error);
        setTasks([]); // Fallback to an empty array
      }
    };

    getProjectTasks();
  }, [projectId, members]); // Add `members` as a dependency

  const getBackgroundColor = (deadline: string, status: string) => {
    const today = new Date();
    const taskDeadline = new Date(deadline);
    const timeDiff = taskDeadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0 && status !== "COMPLETED") {
      return "rgba(255, 0, 0, 0.2)"; // Transparent red
    } else if (daysDiff <= 2 && status === "ONGOING") {
      return "rgba(255, 255, 0, 0.2)"; // Transparent yellow
    } else {
      return "rgba(0, 255, 0, 0.2)"; // Transparent green
    }
  };

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <Navbar />

      <MainContent>
        <h2><strong>Tasks for Project {projectTitle}</strong></h2>
        <TaskList>
          {tasks.map((task) => ( 
            <TaskItem
              key={task.id}
              backgroundColor={getBackgroundColor(task.deadline, task.status)}
              onClick={() => setSelectedTask(task)}
            >
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p className="deadline">Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No Deadline"}</p>
              <p>Status: {task.status}</p>
            </TaskItem>
          ))}
        </TaskList>
      </MainContent>


      {isTaskModalOpen && <AddTaskModal userId={userId || ""} onClose={() => setIsTaskModalOpen(false)} />}
      {
      selectedTask && <MemberTaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </Container>
  );
}