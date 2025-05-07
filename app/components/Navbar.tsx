// components/Navbar.tsx
"use client";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

const Nav = styled.nav`
  background-color: #0070f3;
  padding: 10px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CenterSection = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleButton = styled.button`
  background: none;
  border: 2px solid white;
  border-radius: 12px;
  padding: 6px 12px;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const LogoutButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

interface NavbarProps {
  center?: ReactNode;
  leftExtra?: ReactNode;
}

export default function Navbar({ center, leftExtra }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    router.push("/login"); // Redirect to login page
  };

  return (
    <Nav>
      <LeftSection>
        <TitleButton onClick={() => router.push("/dashboard")}>TaskTile</TitleButton>
        {leftExtra}
      </LeftSection>
      <CenterSection>{center}</CenterSection>
      <RightSection>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </RightSection>
    </Nav>
  );
}
