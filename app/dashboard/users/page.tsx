// app/dashboard/users/page.tsx
// ==========================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import { getAllUsers } from "@/lib/firestore";
import type { User } from "@/types";

export default function UsersPage() {
  const navigate = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-vh-100 bg-light">
        <NavigationBar />

        <Container className="py-5">
          <div className="mb-4">
            <h1 className="display-5 fw-bold mb-2">Users</h1>
            <p className="text-muted">All users in the system</p>
          </div>

          {users.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FaUser size={48} className="text-muted mb-3" />
                <h4>No users found</h4>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-3">
              {users.map((userItem) => (
                <Col key={userItem.id} md={6} lg={4}>
                  <Card
                    className="h-100 card-shadow"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate.push(`/dashboard/users/${userItem.id}`)
                    }
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                          <FaUser className="text-primary" size={24} />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">
                            {userItem.displayName || "No name"}
                          </h6>
                          <small className="text-muted">{userItem.email}</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </ProtectedRoute>
  );
}
