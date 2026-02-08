// app/dashboard/boards/page.tsx
// ==========================================
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge,
  Dropdown,
} from "react-bootstrap";
import {
  FaPlus,
  FaArrowLeft,
  FaEllipsisV,
  FaUserPlus,
  FaTrash,
} from "react-icons/fa";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import TaskCard from "@/components/TaskCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  getBoard,
  getBoardCards,
  getCardTasks,
  createCard,
  createTask,
  updateTask,
  deleteBoard,
} from "@/lib/firestore";
import type { Board, Card as CardType, Task, TaskStatus } from "@/types";

const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: "icebox", label: "Icebox", color: "#2196f3" },
  { value: "backlog", label: "Backlog", color: "#ff9800" },
  { value: "ongoing", label: "Ongoing", color: "#9c27b0" },
  { value: "waiting-review", label: "Waiting for Review", color: "#fbc02d" },
  { value: "done", label: "Done", color: "#4caf50" },
];

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const boardId = params?.id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Forms
  const [newCardName, setNewCardName] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("icebox");

  // Drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (boardId && user) {
      loadBoardData();
    }
  }, [boardId, user]);

  const loadBoardData = async () => {
    try {
      const boardData = await getBoard(boardId);
      if (!boardData) {
        router.push("/dashboard");
        return;
      }
      setBoard(boardData);

      const boardCards = await getBoardCards(boardId);
      setCards(boardCards);

      // Load all tasks for all cards
      const allTasks: Task[] = [];
      for (const card of boardCards) {
        const cardTasks = await getCardTasks(card.id);
        allTasks.push(...cardTasks);
      }
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading board:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createCard(boardId, newCardName, newCardDescription, user.uid);
      setShowCreateCardModal(false);
      setNewCardName("");
      setNewCardDescription("");
      loadBoardData();
    } catch (error) {
      console.error("Error creating card:", error);
      alert("Failed to create card");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCard) return;

    try {
      await createTask(
        boardId,
        selectedCard,
        newTaskTitle,
        newTaskDescription,
        user.uid,
        newTaskStatus,
      );
      setShowCreateTaskModal(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("icebox");
      setSelectedCard(null);
      loadBoardData();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overStatus = over.id as TaskStatus;

    if (activeTask && activeTask.status !== overStatus) {
      // Update task status
      await updateTask(activeTask.id, { status: overStatus });
      loadBoardData();
    }

    setActiveId(null);
  };

  const handleDeleteBoard = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this board? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteBoard(boardId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("Failed to delete board");
    }
  };

  const openCreateTaskModal = (cardId: string) => {
    setSelectedCard(cardId);
    setShowCreateTaskModal(true);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-vh-100 bg-light">
        <NavigationBar />

        <Container fluid className="py-4">
          {/* Board Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                className="text-decoration-none me-3"
                onClick={() => router.push("/dashboard")}
              >
                <FaArrowLeft className="me-2" />
                Back to Dashboard
              </Button>
              <div>
                <h2 className="fw-bold mb-1">{board.name}</h2>
                <p className="text-muted mb-0">{board.description}</p>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm">
                <FaUserPlus className="me-2" />
                Invite Members
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateCardModal(true)}
              >
                <FaPlus className="me-2" />
                Add Card
              </Button>
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  <FaEllipsisV />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={handleDeleteBoard}
                    className="text-danger"
                  >
                    <FaTrash className="me-2" />
                    Delete Board
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Row className="g-3">
              {TASK_STATUSES.map((status) => {
                const statusTasks = tasks.filter(
                  (t) => t.status === status.value,
                );

                return (
                  <Col key={status.value} lg={2.4} md={4} sm={6}>
                    <Card className="shadow-sm border-0 h-100">
                      <Card.Header
                        className="bg-white border-bottom-3"
                        style={{ borderBottomColor: status.color }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="fw-bold mb-0">{status.label}</h6>
                          <Badge bg="secondary" pill>
                            {statusTasks.length}
                          </Badge>
                        </div>
                      </Card.Header>
                      <Card.Body
                        className="p-2"
                        style={{
                          minHeight: "400px",
                          maxHeight: "70vh",
                          overflowY: "auto",
                        }}
                      >
                        <SortableContext
                          items={statusTasks.map((t) => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="d-flex flex-column gap-2">
                            {statusTasks.map((task) => (
                              <TaskCard key={task.id} task={task} />
                            ))}
                          </div>
                        </SortableContext>

                        {statusTasks.length === 0 && (
                          <div className="text-center text-muted py-4">
                            <small>No tasks</small>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            <DragOverlay>
              {activeId ? (
                <TaskCard
                  task={tasks.find((t) => t.id === activeId)!}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Cards Section */}
          {cards.length > 0 && (
            <div className="mt-5">
              <h4 className="fw-bold mb-3">Cards</h4>
              <Row className="g-3">
                {cards.map((card) => (
                  <Col key={card.id} md={6} lg={4}>
                    <Card className="shadow-sm border-0 card-shadow">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold mb-0">{card.name}</h6>
                          <Badge bg="info" pill>
                            {card.tasksCount || 0} tasks
                          </Badge>
                        </div>
                        <p className="text-muted small mb-3">
                          {card.description}
                        </p>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openCreateTaskModal(card.id)}
                        >
                          <FaPlus className="me-1" />
                          Add Task
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Container>

        {/* Create Card Modal */}
        <Modal
          show={showCreateCardModal}
          onHide={() => setShowCreateCardModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Create New Card</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateCard}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Card Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Website Redesign"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="What's this card about?"
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowCreateCardModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Card
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Create Task Modal */}
        <Modal
          show={showCreateTaskModal}
          onHide={() => setShowCreateTaskModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Create New Task</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateTask}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Task Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Design homepage mockup"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
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
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={newTaskStatus}
                  onChange={(e) =>
                    setNewTaskStatus(e.target.value as TaskStatus)
                  }
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowCreateTaskModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Task
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
// ==========================================
