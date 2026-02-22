// components/NavigationBar.tsx
// ==========================================
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Navbar, Container, Nav, NavDropdown, Button } from "react-bootstrap";
import { FaUser, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationBarProps {
  onCreateBoard?: () => void;
}

export default function NavigationBar({ onCreateBoard }: NavigationBarProps) {
  const router = useRouter();
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="/dashboard" className="fw-bold">
          Mini Trello
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            <Nav.Link href="/dashboard/boards">My Boards</Nav.Link>
            <Nav.Link href="/dashboard/users">Users</Nav.Link>
          </Nav>

          <Nav className="ms-auto align-items-center">
            {onCreateBoard && (
              <Button
                variant="primary"
                size="sm"
                onClick={onCreateBoard}
                className="me-3"
              >
                <FaPlus className="me-2" />
                Create Board
              </Button>
            )}

            <NavDropdown
              title={
                <span>
                  <FaUser className="me-2" />
                  {userProfile?.displayName || user?.email || "User"}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as="div">
                <div className="text-muted small">{user?.email}</div>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item
                onClick={() => router.push("/dashboard/profile")}
              >
                <FaUser className="me-2" />
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleSignOut}>
                <FaSignOutAlt className="me-2" />
                Sign Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
// ==========================================
