"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import ProfileModal from "../components/ProfileModal";
import AddTaskModal from "../components/AddTaskModal";
import TaskDetailsModal from "../components/TaskDetailsModal";

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
`;

const ContentContainer = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease-in-out;
  margin-left: ${({ $isOpen }) => ($isOpen ? "250px" : "0")};
  padding: 20px;
`;
const Navbar = styled.nav`
  background-color: #0070f3;
  padding: 10px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
`;

const Logo = styled.span`
  font-size: 24px;
  font-weight: bold;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
`;

const TaskList = styled.div`
  margin-top: 20px;
`;

const TaskItem = styled.div`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
  background-color: #f5f5f5;
`;

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
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
    const getDetails = async () => {
      if (!userId) return;

      try {
        const responseDetails = await fetch("http://localhost:3001/auth/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        });

        const detailsData = await responseDetails.json();
        setUser({ username: detailsData.username, email: detailsData.email });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getDetails();
  }, [userId]);

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
      <ContentContainer $isOpen={isSidebarOpen}>
        <Navbar>
          <MenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</MenuButton>
          <Logo>TaskTile</Logo>
          <button onClick={() => setIsTaskModalOpen(true)}>Add Task</button>
        </Navbar>
        <MainContent>
          <TaskList>
            {tasks.map((task) => (
              <TaskItem key={task.id} onClick={() => setSelectedTask(task)}>
                {task.name}
              </TaskItem>
            ))}
          </TaskList>
        </MainContent>
      </ContentContainer>
      {isTaskModalOpen && <AddTaskModal userId={userId || ""} onClose={() => setIsTaskModalOpen(false)} />}
      {selectedTask && <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </Container>
  );
}
