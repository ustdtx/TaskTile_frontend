/*'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Navbar from "../components/Navbar";

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

const ProjectList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
`;

const ProjectItem = styled.div`
  flex: 0 1 calc(33.333% - 20px);
  background-color: rgba(0, 0, 255, 0.1); 
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
`;

export default function ProjectsPage() {
  interface Project {
    id: string;
    name: string;
    description: string;
  }

  const [projects, setProjects] = useState<Project[]>([]);
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
    if (!userId) return;

    fetch(`http://localhost:3001/projects/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(
            data.map((pm: any) => ({
              id: pm.project.id,
              name: pm.project.name,
              description: pm.project.description,
            }))
          );
        } else {
          console.error("Expected array but got:", data);
        }
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  }, [userId]);

  if (isAuthenticated === null) return <p>Loading...</p>;

  return (
    <Container>
      <Navbar />

      <MainContent>
        <h2>Your Projects</h2>
        <ProjectList>
          {projects.map((project) => (
            <ProjectItem key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description || "No description"}</p>
            </ProjectItem>
          ))}
        </ProjectList>
      </MainContent>
    </Container>
  );
}*/

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

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

const ProjectList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
`;

const ProjectItem = styled.div`
  flex: 0 1 calc(33.333% - 20px);
  background-color: rgba(0, 0, 255, 0.1); 
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
`;

const ModalContent = styled.div`
  padding: 20px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
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

const Section = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
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

interface Project {
  id: string;
  name: string;
  description: string;
  isManager?: boolean;
}

interface User {
  id: string;
  username: string;
  isManager: boolean;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
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
    if (!userId) return;

    fetch(`http://localhost:3001/projects/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(
            data.map((pm: any) => ({
              id: pm.project.id,
              name: pm.project.name,
              description: pm.project.description,
              isManager: pm.isManager
            }))
          );
        } else {
          console.error("Expected array but got:", data);
        }
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  }, [userId]);

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    if (project.isManager) {
      // Fetch members if user is manager
      fetch(`http://localhost:3001/projects/${project.id}/members`)
        .then(res => res.json())
        .then(data => {
          setMembers(data.map((member: any) => ({
            id: member.user.id,
            username: member.user.username,
            isManager: member.isManager
          })));
        })
        .catch(err => console.error("Error fetching members:", err));
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProject(null);
    setSearchTerm('');
    setMembers([]);
    setSelectedMember(null);
  };

  const handleSearchUser = () => {
    if (!searchTerm.trim()) return;
    
    fetch(`http://localhost:3001/projects/search?username=${searchTerm}`)
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
    if (!selectedProject || !selectedMember) return;
    
    fetch('http://localhost:3001/projects/add-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        projectId: selectedProject.id,
        username: members.find(m => m.id === selectedMember)?.username
      })
    })
    .then(res => res.json())
    .then(data => {
      const updatedMembers = members.map(m => 
        m.id === selectedMember ? {...m, isManager: false} : m
      );
      setMembers(updatedMembers);
      setSelectedMember(null);
    })
    .catch(err => console.error("Error adding member:", err));
  };

  const promoteToManager = (memberId: string) => {
    if (!selectedProject) return;
    
    fetch('http://localhost:3001/projects/update-role', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        projectId: selectedProject.id,
        userId: memberId,
        isManager: true
      })
    })
    .then(res => res.json())
    .then(data => {
      const updatedMembers = members.map(m => 
        m.id === memberId ? {...m, isManager: true} : m
      );
      setMembers(updatedMembers);
    })
    .catch(err => console.error("Error promoting member:", err));
  };

  const removeMember = (memberId: string) => {
    if (!selectedProject) return;
    
    fetch(`http://localhost:3001/projects/remove-member`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        projectId: selectedProject.id,
        userId: memberId
      })
    })
    .then(() => {
      setMembers(members.filter(m => m.id !== memberId));
    })
    .catch(err => console.error("Error removing member:", err));
  };

  const deleteProject = () => {
    if (!selectedProject) return;
    
    if (confirm('Are you sure you want to delete this project?')) {
      fetch(`http://localhost:3001/projects/${selectedProject.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(() => {
        setProjects(projects.filter(p => p.id !== selectedProject.id));
        closeModal();
      })
      .catch(err => console.error("Error deleting project:", err));
    }
  };

  if (isAuthenticated === null) return <p>Loading...</p>;

  return (
    <Container>
      <Navbar />

      <MainContent>
        <h2>Your Projects</h2>
        <ProjectList>
          {projects.map((project) => (
            <ProjectItem key={project.id} onClick={() => openProjectModal(project)}>
              <h3>{project.name}</h3>
              <p>{project.description || "No description"}</p>
              {project.isManager && <p style={{color: 'green'}}>Manager</p>}
            </ProjectItem>
          ))}
        </ProjectList>
      </MainContent>

      <Dialog.Root open={modalIsOpen} onOpenChange={setModalIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }} />
          <Dialog.Content style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            zIndex: 1001,
          }}>
            <ModalContent>
              <Dialog.Close asChild>
                <CloseButton aria-label="Close">
                  <Cross2Icon />
                </CloseButton>
              </Dialog.Close>
              
              {selectedProject && (
                <>
                  <Dialog.Title style={{ marginBottom: '10px', fontSize: '20px' }}>
                    {selectedProject.name}
                  </Dialog.Title>
                  <Dialog.Description style={{ marginBottom: '20px', color: '#666' }}>
                    {selectedProject.description}
                  </Dialog.Description>

                  <ButtonGroup>
                    <ActionButton onClick={() => router.push(`/projects/${selectedProject.id}`)}>
                      Enter Project
                    </ActionButton>
                    
                    {selectedProject.isManager && (
                      <>
                        <ActionButton onClick={() => alert('Edit project details would go here')}>
                          Edit Project
                        </ActionButton>
                        <ActionButton onClick={() => router.push(`/projects/${selectedProject.id}/tasks`)}>
                          Add Tasks
                        </ActionButton>
                      </>
                    )}
                  </ButtonGroup>

                  {selectedProject.isManager && (
                    <>
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
                                  {member.isManager && <span style={{color: 'green', marginLeft: '5px'}}>(Manager)</span>}
                                </span>
                                <div>
                                  {!member.isManager && (
                                    <ActionButton 
                                      onClick={() => promoteToManager(member.id)}
                                      style={{marginRight: '5px'}}
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
                    </>
                  )}
                </>
              )}
            </ModalContent>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
}