'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import Navbar from "../../components/Navbar";

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

const Section = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #0070f3;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #005bb5;
  }
`;

const DangerButton = styled(ActionButton)`
  background-color: #ff3333;

  &:hover {
    background-color: #cc0000;
  }
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 10px;
`;

const MemberList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
`;

const MemberItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
`;

interface User {
  id: string;
  username: string;
  isManager: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

export default function ProjectManagerView() {
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params?.projectId) ? params.projectId[0] : params?.projectId;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth check (copy-paste from your pattern)
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

  // Fetch project and members after auth
  useEffect(() => {
    if (!isAuthenticated || !userId || !projectId) return;
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:3001/projects/${projectId}`).then(res => res.json()),
      fetch(`http://localhost:3001/projects/${projectId}/members`).then(res => res.json()),
    ])
      .then(([projectData, membersData]) => {
        setProject(projectData);
        setMembers(
          membersData.map((member: any) => ({
            id: member.user.id,
            username: member.user.username,
            isManager: member.isManager,
          }))
        );
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error("Error loading project or members:", err);
      });
  }, [isAuthenticated, userId, projectId]);

  const handleSearchUser = () => {
    if (!searchTerm.trim()) return;
    fetch(`http://localhost:3001/users/search?username=${searchTerm}`)
      .then(res => res.json())
      .then(data => {
        if (data && !members.some(m => m.username === data.username)) {
          setMembers([...members, {
            id: data.id,
            username: data.username,
            isManager: false
          }]);
          setSearchTerm('');
        }
      })
      .catch(err => console.error("Error searching user:", err));
  };

  const addMemberToProject = () => {
    if (!projectId || !selectedMember) return;
    fetch('http://localhost:3001/projects/add-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        projectId,
        username: members.find(m => m.id === selectedMember)?.username
      })
    })
    .then(res => res.json())
    .then(() => {
      const updatedMembers = members.map(m =>
        m.id === selectedMember ? { ...m, isManager: false } : m
      );
      setMembers(updatedMembers);
      setSelectedMember(null);
    })
    .catch(err => console.error("Error adding member:", err));
  };

  const promoteToManager = (memberId: string) => {
    if (!projectId) return;
    fetch('http://localhost:3001/projects/update-role', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        projectId,
        userId: memberId,
        isManager: true
      })
    })
    .then(res => res.json())
    .then(() => {
      const updatedMembers = members.map(m =>
        m.id === memberId ? { ...m, isManager: true } : m
      );
      setMembers(updatedMembers);
    })
    .catch(err => console.error("Error promoting member:", err));
  };

  const removeMember = (memberId: string) => {
    if (!projectId) return;
    fetch(`http://localhost:3001/projects/remove-member`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        projectId,
        userId: memberId
      })
    })
    .then(() => {
      setMembers(members.filter(m => m.id !== memberId));
    })
    .catch(err => console.error("Error removing member:", err));
  };

  const deleteProject = () => {
    if (!projectId) return;
    if (confirm('Are you sure you want to delete this project?')) {
      fetch(`http://localhost:3001/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(() => {
        router.push('/projects');
      })
      .catch(err => console.error("Error deleting project:", err));
    }
  };

  if (isAuthenticated === null || loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <Container>
      <Navbar />
      <MainContent>
        <h2>{project.name}</h2>
        <p>{project.description}</p>

        <ButtonGroup>
          <ActionButton onClick={() => alert('Edit project details would go here')}>
            Edit Project
          </ActionButton>
          <ActionButton onClick={() => router.push(`/projects/${project.id}/tasks`)}>
            Add Tasks
          </ActionButton>
        </ButtonGroup>

        <Section>
          <h3>Add Members</h3>
          <Input
            type="text"
            placeholder="Search username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ButtonGroup>
            <ActionButton onClick={handleSearchUser}>Search</ActionButton>
            {selectedMember && (
              <ActionButton onClick={addMemberToProject}>Add Member</ActionButton>
            )}
          </ButtonGroup>
        </Section>

        {members.length > 0 && (
          <Section>
            <h3>Project Members</h3>
            <MemberList>
              {members.map(member => (
                <MemberItem key={member.id}>
                  <span>
                    {member.username}
                    {member.isManager && <span style={{ color: 'green', marginLeft: '5px' }}>(Manager)</span>}
                  </span>
                  <div>
                    {!member.isManager && (
                      <ActionButton
                        onClick={() => promoteToManager(member.id)}
                        style={{ marginRight: '5px' }}
                      >
                        Make Manager
                      </ActionButton>
                    )}
                    <DangerButton onClick={() => removeMember(member.id)}>
                      Remove
                    </DangerButton>
                  </div>
                </MemberItem>
              ))}
            </MemberList>
          </Section>
        )}

        <Section>
          <h3>Danger Zone</h3>
          <DangerButton onClick={deleteProject}>
            Delete Project
          </DangerButton>
        </Section>
      </MainContent>
    </Container>
  );
}
