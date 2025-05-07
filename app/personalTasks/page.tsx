"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
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

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
  background-color: #f0f2f5;
`;

const TaskList = styled.div`
  margin-top: 20px;
`;

const TaskItem = styled.div`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  background-color: #fff;

  &:hover {
    background-color: #eaf4ff;
  }
`;

export default function TasksPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<{ id: string; name: string }[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string; name: string } | null>(null);

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

  useEffect(() => {
    const getTasks = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:3001/auth/user/${userId}`);
        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    getTasks();
  }, [userId]);

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <Navbar />

      <MainContent>
        <h2>Your Tasks</h2>
        <TaskList>
          {tasks.map((task) => (
            <TaskItem key={task.id} onClick={() => setSelectedTask(task)}>
              {task.name}
            </TaskItem>
          ))}
        </TaskList>
      </MainContent>

      {isTaskModalOpen && <AddTaskModal userId={userId || ""} onClose={() => setIsTaskModalOpen(false)} />}
      {selectedTask && <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </Container>
  );
}