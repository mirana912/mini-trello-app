// app/dashboard/boards/[id]/cards/[cardId]/page.tsx
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
  Badge,
} from "react-bootstrap";
import { FaPlus, FaArrowLeft, FaTrash } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import { getCard, getCardTasks, createTask, deleteCard } from "@/lib/firestore";
import type { Card as CardType, Task, TaskStatus } from "@/types";

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "icebox", label: "Icebox", color: "primary" },
  { value: "backlog", label: "Backlog", color: "warning" },
  { value: "ongoing", label: "Ongoing", color: "info" },
  { value: "waiting-review", label: "Waiting Review", color: "secondary" },
  { value: "done", label: "Done", color: "success" },
];

export default function CardDetailPage() {
  const params = useParams();
  const navigate = useRouter();
  const { user } = useAuth();
  const boardId = params?.id as string;
  const cardId = params?.cardId as string;

  const [card, setCard] = useState<CardType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("icebox");
  const [taskPriority, setTaskPriority] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (boardId && cardId && user) {
      loadData();
    }
  }, [boardId, cardId, user]);

  const loadData = async () => {
    try {
      const cardData = await getCard(cardId);
      if (!cardData) {
        navigate.push(`/dashboard/boards/${boardId}/cards`);
        return;
      }
      setCard(cardData);

      const tasksData = await getCardTasks(cardId);
      setTasks(tasksData);
    } catch (err) {
      console.error("Error loading card:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    try {
      await createTask(
        boardId,
        cardId,
        taskTitle,
        taskDesc,
        user.uid,
        taskStatus,
      );

      setShowModal(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskStatus("icebox");
      setTaskPriority("medium");
      setTaskDeadline("");
      loadData();
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!confirm("Delete this card? All tasks will be deleted.")) return;

    try {
      await deleteCard(cardId);
      navigate.push(`/dashboard/boards/${boardId}/cards`);
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Failed to delete card");
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
                onClick={() =>
                  navigate.push(`/dashboard/boards/${boardId}/cards`)
                }
              >
                <FaArrowLeft className="me-2" />
                Back to Cards
              </Button>
              <div className="ms-3">
                <h2 className="fw-bold mb-0">{card?.name}</h2>
                <p className="text-muted mb-0">{card?.description}</p>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <FaPlus className="me-2" />
                New Task
              </Button>
              <Button variant="outline-danger" onClick={handleDeleteCard}>
                <FaTrash />
              </Button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <h4>No tasks yet</h4>
                <p className="text-muted">Create your first task</p>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Create Task
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-3">
              {tasks.map((task) => {
                const statusConfig = STATUS_OPTIONS.find(
                  (s) => s.value === task.status,
                );
                return (
                  <Col key={task.id} md={6} lg={4}>
                    <Card className="h-100 card-shadow">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold">{task.title}</h6>
                          <Badge bg={statusConfig?.color}>
                            {statusConfig?.label}
                          </Badge>
                        </div>
                        <p className="text-muted small">{task.description}</p>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          {/* <Badge
                            bg={
                              task.priority === "critical"
                                ? "danger"
                                : task.priority === "high"
                                  ? "warning"
                                  : task.priority === "medium"
                                    ? "info"
                                    : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge> */}
                          {task.deadline && (
                            <small className="text-muted">
                              Due:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Container>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Task</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateTask}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Task Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Fix login bug"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Task details..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={taskStatus}
                      onChange={(e) =>
                        setTaskStatus(e.target.value as TaskStatus)
                      }
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Deadline (Optional)</Form.Label>
                <Form.Control
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Task"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
