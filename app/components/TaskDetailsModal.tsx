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
  const [editedTask, setEditedTask] = useState({
    name: task.name || "",
    description: task.description || "",
    deadline: task.deadline || "",
    status: task.status || "ONGOING"
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value || "None" });
  };

  const handleEdit = async () => {
    if (!editedTask.name) return;
    await fetch(`http://localhost:3001/task/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editedTask.name,
        description: editedTask.description || "None",
        deadline: editedTask.deadline || "None",
        status: editedTask.status || "None"
      }),
    });
    setIsEditing(false);
    onClose();
  };

  const handleDelete = async () => {
    await fetch(`http://localhost:3001/task/${task.id}`, { method: "DELETE" });
    onClose();
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {showConfirm ? (
          <>
            <p>Are you sure you want to delete this task?</p>
            <ButtonContainer>
              <Button onClick={() => setShowConfirm(false)}>No</Button>
              <DeleteButton onClick={handleDelete}>Yes</DeleteButton>
            </ButtonContainer>
          </>
        ) : isEditing ? (
          <>
            <h2>Edit Task</h2>
            <FormGroup>
              <Label>Name:</Label>
              <Input name="name" value={editedTask.name} onChange={handleEditChange} required />
            </FormGroup>
            <FormGroup>
              <Label>Description:</Label>
              <TextArea name="description" value={editedTask.description} onChange={handleEditChange} />
            </FormGroup>
            <FormGroup>
              <Label>Deadline:</Label>
              <Input name="deadline" value={editedTask.deadline} onChange={handleEditChange} type="date" />
            </FormGroup>
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
            <p><strong>Deadline:</strong> {task.deadline || "No deadline"}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <ButtonContainer>
              <EditButton onClick={() => setIsEditing(true)}>Edit Task</EditButton>
              <DeleteButton onClick={() => setShowConfirm(true)}>Delete Task</DeleteButton>
            </ButtonContainer>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}
