"use client";
import styled from "styled-components";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
  openProfile: () => void;
};

const SidebarContainer = styled.div<{ isOpen: boolean }>`
  background-color: #f9f9f9;
  height: 100%;
  width: ${({ isOpen }) => (isOpen ? "250px" : "0")};
  overflow-x: hidden;
  transition: width 0.3s ease-in-out;
  border-right: 1px solid #ddd;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
`;

const SidebarItem = styled.div`
  padding: 10px 20px;
  color: #333;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
`;

export default function Sidebar({ isOpen, toggleSidebar, openProfile }: SidebarProps) {
  return (
    <SidebarContainer isOpen={isOpen}>
      <div style={{ padding: "20px" }}>
        <SidebarItem onClick={openProfile}>Profile</SidebarItem>
        <SidebarItem>Add Task</SidebarItem>
        <SidebarItem>Create Group</SidebarItem>
      </div>
    </SidebarContainer>
  );
}
