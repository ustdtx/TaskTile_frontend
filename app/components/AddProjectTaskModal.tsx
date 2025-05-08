import { useState, useEffect } from "react";
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const Select = styled.select`
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

export default function AddProjectTaskModal({
  onClose,
  userId,
  projectId,
}: {
  onClose: () => void;
  userId: string;
  projectId: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [members, setMembers] = useState<{ id: string; username: string }[]>([]);
  const [assigneeId, setAssigneeId] = useState("");

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
      } catch (error) {
        console.error("Error fetching project members:", error);
      }
    };

    fetchMembers();
  }, [projectId]);

  const handleAddTask = async () => {
    if (!title) {
      alert("Task title is required!");
      return;
    }

    if (!assigneeId) {
      alert("Please select a member to assign the task to.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/project-tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          deadline: deadline || null,
          projectId,
          assignedTo: assigneeId,
          createdBy: userId,
        }),
      });

      if (response.ok) {
        alert("Task added successfully!");
        onClose();
      } else {
        alert("Failed to add task.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        <h2>Add Task Details</h2>
        <Input
          placeholder="Task Title (Required)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextArea
          placeholder="Task Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Deadline (Optional)"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <Select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Assign to (Required)</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.username}
            </option>
          ))}
        </Select>
        <Button onClick={handleAddTask}>Add Task</Button>
      </ModalContent>
    </ModalOverlay>
  );
}
