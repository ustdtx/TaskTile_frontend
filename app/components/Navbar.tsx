"use client";
import styled from "styled-components";

type NavbarProps = {
  toggleSidebar: () => void;
};

const NavbarContainer = styled.nav`
  background-color: #0070f3;
  padding: 10px 20px;
  color: white;
  width: 100%;
  display: flex;
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

export default function Navbar({ toggleSidebar }: NavbarProps) {
  return (
    <NavbarContainer>
      <MenuButton onClick={toggleSidebar}>☰</MenuButton>
      <Logo>TaskTile</Logo>
    </NavbarContainer>
  );
}