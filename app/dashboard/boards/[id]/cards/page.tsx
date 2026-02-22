// app/dashboard/boards/[id]/cards/page.tsx
// ==========================================
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { FaPlus, FaArrowLeft, FaTasks } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import { getBoard, getBoardCards, createCard } from "@/lib/firestore";
import type { Board, Card as CardType } from "@/types";

export default function CardsPage() {
  const params = useParams();
  const navigate = useRouter();
  const { user } = useAuth();
  const boardId = params?.id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardDesc, setCardDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (boardId && user) {
      loadData();
    }
  }, [boardId, user]);

  const loadData = async () => {
    try {
      const boardData = await getBoard(boardId);
      if (!boardData) {
        navigate.push("/dashboard");
        return;
      }
      setBoard(boardData);

      const cardsData = await getBoardCards(boardId);
      setCards(cardsData);
    } catch (err) {
      console.error("Error loading cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    try {
      await createCard(boardId, cardName, cardDesc, user.uid);
      setShowModal(false);
      setCardName("");
      setCardDesc("");
      loadData();
    } catch (err) {
      console.error("Error creating card:", err);
      alert("Failed to create card");
    } finally {
      setIsCreating(false);
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

        <Container className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                onClick={() => navigate.push(`/dashboard/boards/${boardId}`)}
              >
                <FaArrowLeft className="me-2" />
                Back to Board
              </Button>
              <div className="ms-3">
                <h2 className="fw-bold mb-0">{board?.name}</h2>
                <p className="text-muted mb-0">Manage Cards</p>
              </div>
            </div>

            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              New Card
            </Button>
          </div>

          {cards.length === 0 ? (
            <Row>
              <Col md={{ span: 6, offset: 3 }}>
                <Card className="text-center py-5">
                  <Card.Body>
                    <FaTasks size={48} className="text-muted mb-3" />
                    <h4>No cards yet</h4>
                    <p className="text-muted">
                      Create your first card to organize tasks
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setShowModal(true)}
                    >
                      Create Card
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row className="g-3">
              {cards.map((card) => (
                <Col key={card.id} md={4}>
                  <Card
                    className="h-100 card-shadow"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate.push(
                        `/dashboard/boards/${boardId}/cards/${card.id}`,
                      )
                    }
                  >
                    <Card.Body>
                      <h5 className="fw-bold">{card.name}</h5>
                      <p className="text-muted">{card.description}</p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                          {card.tasksCount || 0} tasks
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Card</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateCard}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Card Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Development Tasks"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="What's this card for?"
                  value={cardDesc}
                  onChange={(e) => setCardDesc(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Card"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
