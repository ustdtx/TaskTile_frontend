'use client';
import { useState } from "react";
import styled from "styled-components";
import { useEffect } from "react";


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
  text-align: left;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #ccc;
  cursor: pointer;
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  width: 45%;
`;

const EditButton = styled(Button)`
  background-color: #28a745;
  color: white;
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  color: white;
`;

const FormGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Label = styled.label`
  width: 100px;
  font-weight: bold;
`;

const Input = styled.input`
  flex: 1;
  padding: 5px;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 5px;
`;

const Select = styled.select`
  flex: 1;
  padding: 5px;
`;

export default function TaskDetailsModal({ task, onClose }: { task: any; onClose: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState({
    status: task.status || "ONGOING", // Only allow editing the status
  });

  const handleEditChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }

      try {
        const response = await fetch("http://localhost:3001/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (response.ok) {
          setUserId(data.userId);
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    };

    checkAuth();
  }, []);

  const handleEdit = async () => {
    if (!editedTask.status) return;
    await fetch(`http://localhost:3001/project-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: editedTask.status,
        editorId: userId, // Only update the status
      }),
    });
    setIsEditing(false);
    window.location.reload(); // Refresh the page unconditionally
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {isEditing ? (
          <>
            <h2>Edit Task Status</h2>
            <FormGroup>
              <Label>Status:</Label>
              <Select name="status" value={editedTask.status} onChange={handleEditChange}>
                <option value="ONGOING">ONGOING</option>
                <option value="PAUSED">PAUSED</option>
                <option value="COMPLETED">COMPLETED</option>
              </Select>
            </FormGroup>
            <ButtonContainer>
              <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              <EditButton onClick={handleEdit}>Save</EditButton>
            </ButtonContainer>
          </>
        ) : (
          <>
            <h2>{task.name}</h2>
            <p><strong>Description:</strong> {task.description || "No description"}</p>
            <p><strong>Deadline:</strong> {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <ButtonContainer>
              <EditButton onClick={() => setIsEditing(true)}>Edit Status</EditButton>
            </ButtonContainer>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}
