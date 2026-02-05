// src/app/dashboard/boards/page.tsx
// ==========================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge,
} from "react-bootstrap";
import { FaPlus, FaUsers, FaTasks } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import { getUserBoards, createBoard, getBoardCards } from "@/lib/firestore";
import type { Board } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user]);

  const loadBoards = async () => {
    if (!user) return;

    try {
      const userBoards = await getUserBoards(user.uid);
      setBoards(userBoards);
    } catch (error) {
      console.error("Error loading boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      const boardId = await createBoard(
        newBoardName,
        newBoardDescription,
        user.uid,
      );
      setShowCreateModal(false);
      setNewBoardName("");
      setNewBoardDescription("");
      router.push(`/dashboard/boards/${boardId}`);
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-vh-100 bg-light">
        <NavigationBar onCreateBoard={() => setShowCreateModal(true)} />

        <Container className="py-5">
          <div className="mb-4">
            <h1 className="display-5 fw-bold mb-2">My Boards</h1>
            <p className="text-muted">
              Manage your projects and collaborate with your team
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : boards.length === 0 ? (
            <Row>
              <Col md={{ span: 6, offset: 3 }}>
                <Card className="text-center py-5 shadow-sm border-0">
                  <Card.Body>
                    <div className="mb-4">
                      <div
                        className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <FaTasks className="text-primary" size={32} />
                      </div>
                    </div>
                    <h3 className="fw-bold mb-3">No boards yet</h3>
                    <p className="text-muted mb-4">
                      Create your first board to start organizing your tasks
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <FaPlus className="me-2" />
                      Create Your First Board
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row className="g-4">
              {boards.map((board) => (
                <Col key={board.id} md={6} lg={4}>
                  <Card
                    className="h-100 shadow-sm border-0 card-shadow"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/dashboard/boards/${board.id}`)}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="fw-bold mb-0">{board.name}</h5>
                        <Badge bg="primary" pill>
                          <FaUsers className="me-1" />
                          {board.members?.length || 0}
                        </Badge>
                      </div>
                      <p className="text-muted mb-3">
                        {board.description || "No description"}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Updated{" "}
                          {formatDistanceToNow(board.updatedAt, {
                            addSuffix: true,
                          })}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}

              {/* Create New Board Card */}
              <Col md={6} lg={4}>
                <Card
                  className="h-100 shadow-sm border-2 border-dashed"
                  style={{ cursor: "pointer", borderStyle: "dashed" }}
                  onClick={() => setShowCreateModal(true)}
                >
                  <Card.Body className="d-flex align-items-center justify-content-center py-5">
                    <div className="text-center">
                      <div
                        className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <FaPlus className="text-primary" size={24} />
                      </div>
                      <h6 className="fw-bold text-primary mb-0">
                        Create New Board
                      </h6>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>

        {/* Create Board Modal */}
        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Create New Board</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateBoard}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Board Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Marketing Campaign"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="What's this board about?"
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Board"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
// ==========================================
