import { useState } from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: #0070f3;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  width: 100%;
  margin-top: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ddd;
  &:hover {
    background-color: #bbb;
  }
`;

export default function AddTaskModal({ onClose, userId }: { onClose: () => void; userId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleAddTask = async () => {
    if (!userId) {
      console.error("User ID is missing!");
      return;
    }

    await fetch("http://localhost:3001/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, deadline: deadline || null, status: "ONGOING", userId }),
    });

    onClose();
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        <h2>Add Task</h2>
        <Input placeholder="Task Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <Button onClick={handleAddTask}>Add Task</Button>
      </ModalContent>
    </ModalOverlay>
  );
}
