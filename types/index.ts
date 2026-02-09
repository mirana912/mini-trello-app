// types/index.ts
// ==========================================

// User Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Board Types
export interface Board {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Card Types
export interface Card {
  id: string;
  boardId: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  tasksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Task Status Types
export type TaskStatus =
  | "icebox"
  | "backlog"
  | "ongoing"
  | "waiting-review"
  | "done";

// Task Types
export interface Task {
  id: string;
  cardId: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  ownerId: string;
  assignedTo: string[];
  priority?: "low" | "medium" | "high";
  deadline?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Invitation Types
export type InvitationStatus = "pending" | "accepted" | "declined";

export interface Invitation {
  id: string;
  boardId: string;
  boardOwnerId: string;
  memberId: string;
  memberEmail: string;
  status: InvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// GitHub Integration Types
export type GitHubAttachmentType = "pull_request" | "commit" | "issue";

export interface GitHubAttachment {
  id: string;
  taskId: string;
  type: GitHubAttachmentType;
  number?: string;
  sha?: string;
  title?: string;
  url?: string;
  createdAt: Date;
}

export interface GitHubRepository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
}

// Auth Types
export interface VerificationCode {
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
// ==========================================
