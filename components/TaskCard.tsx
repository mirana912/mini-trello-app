// components/TaskCard.tsx
// ==========================================
"use client";

import { Card, Badge } from "react-bootstrap";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaUser, FaClock } from "react-icons/fa";
import type { Task } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const PRIORITY_COLORS = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export default function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="shadow-sm border-0 mb-0"
    >
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6
            className="fw-semibold mb-0 flex-grow-1"
            style={{ fontSize: "0.9rem" }}
          >
            {task.title}
          </h6>
          {task.priority && (
            <Badge bg={PRIORITY_COLORS[task.priority]} className="ms-2">
              {task.priority}
            </Badge>
          )}
        </div>

        {task.description && (
          <p
            className="text-muted mb-2"
            style={{
              fontSize: "0.8rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.description}
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="d-flex gap-2">
            {task.assignedTo && task.assignedTo.length > 0 && (
              <Badge bg="secondary" className="d-flex align-items-center">
                <FaUser size={10} className="me-1" />
                {task.assignedTo.length}
              </Badge>
            )}
            {task.deadline && (
              <Badge bg="info" className="d-flex align-items-center">
                <FaClock size={10} className="me-1" />
                {formatDistanceToNow(task.deadline, { addSuffix: true })}
              </Badge>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
// ==========================================
