'use client';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Navbar from "../../../components/Navbar";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #2563eb;
  color: white;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const DangerButton = styled(Button)`
  background-color: #dc2626;
  color: white;

  &:hover {
    background-color: #b91c1c;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #6b7280;
  }

  p {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface TaskItemProps {
  urgency: 'today' | 'warning' | 'normal';
}

const TaskItem = styled.div<TaskItemProps>`
  padding: 1rem;
  border-radius: 6px;
  background-color: ${props => 
    props.urgency === 'today' ? '#fee2e2' :
    props.urgency === 'warning' ? '#fef3c7' : '#dcfce7'};
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MemberItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
`;

const SearchSection = styled.div`
  margin-bottom: 1.5rem;

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    margin-bottom: 1rem;
  }
`;

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'completed' | 'pending';
}

interface Member {
  id: string;
  userId: string;
  username: string;
  email: string;
  isManager: boolean;
}

interface ProjectDetailsPageProps {
  projectId: string;
}

export default function ProjectDetailsPage({ projectId }: ProjectDetailsPageProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch project members
        const membersResponse = await fetch(
          `http://localhost:3001/projects/${projectId}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const membersData = await membersResponse.json();
        setMembers(membersData);

        // Fetch project tasks
        const tasksResponse = await fetch(
          `http://localhost:3001/projects/${projectId}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleSearchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/projects/search?username=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/projects/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          userId
        }),
      });

      if (response.ok) {
        const newMember = await response.json();
        setMembers(prev => [...prev, newMember]);
        setSearchResults(prev => prev.filter(m => m.userId !== userId));
      }
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handlePromoteMember = async (memberId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/projects/update-role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          userId: memberId,
          isManager: true
        }),
      });

      setMembers(prev => 
        prev.map(member => 
          member.userId === memberId ? { ...member, isManager: true } : member
        )
      );
    } catch (error) {
      console.error('Promotion failed:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3001/projects/remove-member', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId, userId: memberId }),
      });

      setMembers(prev => prev.filter(m => m.userId !== memberId));
    } catch (error) {
      console.error('Removal failed:', error);
    }
  };

  const getTaskStatus = (deadline: string) => {
    const today = new Date();
    const taskDate = new Date(deadline);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

    if (diffDays <= 0) return 'today';
    if (diffDays <= 2) return 'warning';
    return 'normal';
  };

  return (
    <Container>
      <Navbar />
      <MainContent>
        <ActionBar>
          <PrimaryButton onClick={() => router.push(`/projects/${projectId}/create-task`)}>
            Add Task
          </PrimaryButton>
        </ActionBar>

        <StatsSection>
          <StatCard>
            <h3>Total Members</h3>
            <p>{members.length}</p>
          </StatCard>
          <StatCard>
            <h3>Total Tasks</h3>
            <p>{tasks.length}</p>
          </StatCard>
          <StatCard>
            <h3>Completed Tasks</h3>
            <p>{tasks.filter(t => t.status === 'completed').length}</p>
          </StatCard>
        </StatsSection>

        <ContentGrid>
          <Section>
            <h2>Tasks</h2>
            <TaskList>
              {tasks.map(task => (
                <TaskItem 
                  key={task.id}
                  urgency={getTaskStatus(task.deadline)}
                >
                  <h3>{task.title}</h3>
                  <p>{task.description.substring(0, 50)}</p>
                  <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                </TaskItem>
              ))}
            </TaskList>
          </Section>

          <Section>
            <h2>Members</h2>
            <SearchSection>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <PrimaryButton 
                onClick={handleSearchMembers}
                disabled={loading || !searchQuery}
              >
                {loading ? 'Searching...' : 'Search Users'}
              </PrimaryButton>

              {searchResults.length > 0 && (
                <div>
                  {searchResults.map(user => (
                    <MemberItem key={user.userId}>
                      <div>
                        <div>{user.username}</div>
                        <div>{user.email}</div>
                      </div>
                      <PrimaryButton
                        onClick={() => handleAddMember(user.userId)}
                      >
                        Add
                      </PrimaryButton>
                    </MemberItem>
                  ))}
                </div>
              )}
            </SearchSection>

            <MemberList>
              {members.map(member => (
                <MemberItem key={member.userId}>
                  <div>
                    <div>{member.username}</div>
                    <div>{member.email}</div>
                    {member.isManager && <span>(Manager)</span>}
                  </div>
                  <div>
                    {!member.isManager && (
                      <PrimaryButton
                        onClick={() => handlePromoteMember(member.userId)}
                      >
                        Make Manager
                      </PrimaryButton>
                    )}
                    <DangerButton
                      onClick={() => handleRemoveMember(member.userId)}
                    >
                      Remove
                    </DangerButton>
                  </div>
                </MemberItem>
              ))}
            </MemberList>
          </Section>
        </ContentGrid>
      </MainContent>
    </Container>
  );
}