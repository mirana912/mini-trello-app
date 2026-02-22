// app/dashboard/users/[userId]/page.tsx
// ==========================================
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import { FaArrowLeft, FaUser, FaEdit, FaSave } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import { getUser, updateUser } from "@/lib/firestore";
import type { User } from "@/types";

export default function UserProfilePage() {
  const params = useParams();
  const navigate = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params?.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      const userData = await getUser(userId);
      if (!userData) {
        navigate.push("/dashboard/users");
        return;
      }
      setUser(userData);
      setDisplayName(userData.displayName || "");
      setEmail(userData.email);
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUser(userId, { displayName });
      setIsEditing(false);
      loadUser();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const isOwnProfile = currentUser?.uid === userId;

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
          <Button
            variant="link"
            className="mb-3"
            onClick={() => navigate.push("/dashboard/users")}
          >
            <FaArrowLeft className="me-2" />
            Back to Users
          </Button>

          <Row>
            <Col md={{ span: 8, offset: 2 }}>
              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-center mb-4">
                    <div
                      className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <FaUser className="text-primary" size={48} />
                    </div>
                    <h3 className="fw-bold">
                      {user?.displayName || "No name"}
                    </h3>
                    <p className="text-muted">{user?.email}</p>
                  </div>

                  {isEditing ? (
                    <Form onSubmit={handleSave}>
                      <Form.Group className="mb-3">
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={email}
                          disabled
                          readOnly
                        />
                        <Form.Text className="text-muted">
                          Email cannot be changed
                        </Form.Text>
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSaving}
                        >
                          <FaSave className="me-2" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setIsEditing(false);
                            setDisplayName(user?.displayName || "");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <strong>Display Name:</strong>
                        <p className="text-muted">
                          {user?.displayName || "Not set"}
                        </p>
                      </div>

                      <div className="mb-3">
                        <strong>Email:</strong>
                        <p className="text-muted">{user?.email}</p>
                      </div>

                      <div className="mb-3">
                        <strong>Member Since:</strong>
                        <p className="text-muted">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>

                      {isOwnProfile && (
                        <Button
                          variant="primary"
                          onClick={() => setIsEditing(true)}
                        >
                          <FaEdit className="me-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
