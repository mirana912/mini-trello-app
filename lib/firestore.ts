// lib/firestore.ts
// ==========================================
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Board,
  Card,
  Task,
  Invitation,
  GitHubAttachment,
  User,
} from "@/types";

// Helper function to convert Firestore Timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Collections
export const COLLECTIONS = {
  USERS: "users",
  BOARDS: "boards",
  CARDS: "cards",
  TASKS: "tasks",
  INVITATIONS: "invitations",
  GITHUB_ATTACHMENTS: "github_attachments",
  VERIFICATION_CODES: "verification_codes",
};

// ====================
// USER OPERATIONS
// ====================

export const createUser = async (
  userId: string,
  email: string,
  displayName?: string,
) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    email,
    displayName: displayName || email.split("@")[0],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    // If user doesn't exist, create it
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userDocRef, {
      email,
      displayName: displayName || email.split("@")[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    id: userSnap.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as User;
};

export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: timestampToDate(doc.data().createdAt),
    updatedAt: timestampToDate(doc.data().updatedAt),
  })) as User[];
};

// ====================
// BOARD OPERATIONS
// ====================

export const createBoard = async (
  name: string,
  description: string,
  ownerId: string,
): Promise<string> => {
  const boardRef = await addDoc(collection(db, COLLECTIONS.BOARDS), {
    name,
    description,
    ownerId,
    members: [ownerId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return boardRef.id;
};

export const getBoard = async (boardId: string): Promise<Board | null> => {
  const boardRef = doc(db, COLLECTIONS.BOARDS, boardId);
  const boardSnap = await getDoc(boardRef);

  if (!boardSnap.exists()) return null;

  const data = boardSnap.data();
  return {
    id: boardSnap.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Board;
};

export const getUserBoards = async (userId: string): Promise<Board[]> => {
  const boardsRef = collection(db, COLLECTIONS.BOARDS);
  const q = query(boardsRef, where("members", "array-contains", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: timestampToDate(doc.data().createdAt),
    updatedAt: timestampToDate(doc.data().updatedAt),
  })) as Board[];
};

export const updateBoard = async (
  boardId: string,
  updates: Partial<Board>,
): Promise<void> => {
  const boardRef = doc(db, COLLECTIONS.BOARDS, boardId);
  await updateDoc(boardRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  // Delete all cards in the board
  const cardsRef = collection(db, COLLECTIONS.CARDS);
  const cardsQuery = query(cardsRef, where("boardId", "==", boardId));
  const cardsSnapshot = await getDocs(cardsQuery);

  for (const cardDoc of cardsSnapshot.docs) {
    await deleteCard(cardDoc.id);
  }

  // Delete the board
  const boardRef = doc(db, COLLECTIONS.BOARDS, boardId);
  await deleteDoc(boardRef);
};

// ====================
// CARD OPERATIONS
// ====================

export const createCard = async (
  boardId: string,
  name: string,
  description: string,
  ownerId: string,
): Promise<string> => {
  const cardRef = await addDoc(collection(db, COLLECTIONS.CARDS), {
    boardId,
    name,
    description,
    ownerId,
    members: [ownerId],
    tasksCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return cardRef.id;
};

export const getCard = async (cardId: string): Promise<Card | null> => {
  const cardRef = doc(db, COLLECTIONS.CARDS, cardId);
  const cardSnap = await getDoc(cardRef);

  if (!cardSnap.exists()) return null;

  const data = cardSnap.data();
  return {
    id: cardSnap.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Card;
};

export const getBoardCards = async (boardId: string): Promise<Card[]> => {
  const cardsRef = collection(db, COLLECTIONS.CARDS);
  const q = query(
    cardsRef,
    where("boardId", "==", boardId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: timestampToDate(doc.data().createdAt),
    updatedAt: timestampToDate(doc.data().updatedAt),
  })) as Card[];
};

export const getUserCards = async (userId: string): Promise<Card[]> => {
  const cardsRef = collection(db, COLLECTIONS.CARDS);
  const q = query(cardsRef, where("members", "array-contains", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: timestampToDate(doc.data().createdAt),
    updatedAt: timestampToDate(doc.data().updatedAt),
  })) as Card[];
};

export const updateCard = async (
  cardId: string,
  updates: Partial<Card>,
): Promise<void> => {
  const cardRef = doc(db, COLLECTIONS.CARDS, cardId);
  await updateDoc(cardRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCard = async (cardId: string): Promise<void> => {
  // Delete all tasks in the card
  const tasksRef = collection(db, COLLECTIONS.TASKS);
  const tasksQuery = query(tasksRef, where("cardId", "==", cardId));
  const tasksSnapshot = await getDocs(tasksQuery);

  for (const taskDoc of tasksSnapshot.docs) {
    await deleteTask(taskDoc.id);
  }

  // Delete the card
  const cardRef = doc(db, COLLECTIONS.CARDS, cardId);
  await deleteDoc(cardRef);
};

// ====================
// TASK OPERATIONS
// ====================

export const createTask = async (
  boardId: string,
  cardId: string,
  title: string,
  description: string,
  ownerId: string,
  status: Task["status"] = "icebox",
): Promise<string> => {
  const taskRef = await addDoc(collection(db, COLLECTIONS.TASKS), {
    boardId,
    cardId,
    title,
    description,
    status,
    ownerId,
    assignedTo: [],
    order: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update card's task count
  const cardRef = doc(db, COLLECTIONS.CARDS, cardId);
  const cardSnap = await getDoc(cardRef);
  if (cardSnap.exists()) {
    await updateDoc(cardRef, {
      tasksCount: (cardSnap.data().tasksCount || 0) + 1,
    });
  }

  return taskRef.id;
};

export const getTask = async (taskId: string): Promise<Task | null> => {
  const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
  const taskSnap = await getDoc(taskRef);

  if (!taskSnap.exists()) return null;

  const data = taskSnap.data();
  return {
    id: taskSnap.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    deadline: data.deadline ? timestampToDate(data.deadline) : undefined,
  } as Task;
};

export const getCardTasks = async (cardId: string): Promise<Task[]> => {
  const tasksRef = collection(db, COLLECTIONS.TASKS);
  const q = query(
    tasksRef,
    where("cardId", "==", cardId),
    orderBy("order", "asc"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: timestampToDate(doc.data().createdAt),
    updatedAt: timestampToDate(doc.data().updatedAt),
    deadline: doc.data().deadline
      ? timestampToDate(doc.data().deadline)
      : undefined,
  })) as Task[];
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>,
): Promise<void> => {
  const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  // Get task to update card count
  const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
  const taskSnap = await getDoc(taskRef);

  if (taskSnap.exists()) {
    const cardId = taskSnap.data().cardId;

    // Delete GitHub attachments
    const attachmentsRef = collection(db, COLLECTIONS.GITHUB_ATTACHMENTS);
    const attachmentsQuery = query(
      attachmentsRef,
      where("taskId", "==", taskId),
    );
    const attachmentsSnapshot = await getDocs(attachmentsQuery);

    for (const attachmentDoc of attachmentsSnapshot.docs) {
      await deleteDoc(
        doc(db, COLLECTIONS.GITHUB_ATTACHMENTS, attachmentDoc.id),
      );
    }

    // Update card's task count
    const cardRef = doc(db, COLLECTIONS.CARDS, cardId);
    const cardSnap = await getDoc(cardRef);
    if (cardSnap.exists()) {
      await updateDoc(cardRef, {
        tasksCount: Math.max((cardSnap.data().tasksCount || 1) - 1, 0),
      });
    }
  }

  // Delete the task
  await deleteDoc(taskRef);
};

// ====================
// INVITATION OPERATIONS
// ====================

export const createInvitation = async (
  boardId: string,
  boardOwnerId: string,
  memberId: string,
  memberEmail: string,
): Promise<string> => {
  const invitationRef = await addDoc(collection(db, COLLECTIONS.INVITATIONS), {
    boardId,
    boardOwnerId,
    memberId,
    memberEmail,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return invitationRef.id;
};

export const getInvitation = async (
  invitationId: string,
): Promise<Invitation | null> => {
  const invitationRef = doc(db, COLLECTIONS.INVITATIONS, invitationId);
  const invitationSnap = await getDoc(invitationRef);

  if (!invitationSnap.exists()) return null;

  const data = invitationSnap.data();
  return {
    id: invitationSnap.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Invitation;
};

export const getUserInvitations = async (
  userId: string,
): Promise<Invitation[]> => {
  const invitationsRef = collection(db, COLLECTIONS.INVITATIONS);
  const q = query(
    invitationsRef,
    where("memberId", "==", userId),
    where("status", "==", "pending"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: timestampToDate(doc.data().createdAt),
    updatedAt: timestampToDate(doc.data().updatedAt),
  })) as Invitation[];
};

export const updateInvitation = async (
  invitationId: string,
  status: Invitation["status"],
): Promise<void> => {
  const invitationRef = doc(db, COLLECTIONS.INVITATIONS, invitationId);
  await updateDoc(invitationRef, {
    status,
    updatedAt: serverTimestamp(),
  });

  // If accepted, add member to board
  if (status === "accepted") {
    const invitation = await getInvitation(invitationId);
    if (invitation) {
      const boardRef = doc(db, COLLECTIONS.BOARDS, invitation.boardId);
      const boardSnap = await getDoc(boardRef);
      if (boardSnap.exists()) {
        const members = boardSnap.data().members || [];
        if (!members.includes(invitation.memberId)) {
          await updateDoc(boardRef, {
            members: [...members, invitation.memberId],
          });
        }
      }
    }
  }
};

// ====================
// GITHUB ATTACHMENT OPERATIONS
// ====================

export const createGitHubAttachment = async (
  taskId: string,
  type: GitHubAttachment["type"],
  data: { number?: string; sha?: string; title?: string; url?: string },
): Promise<string> => {
  const attachmentRef = await addDoc(
    collection(db, COLLECTIONS.GITHUB_ATTACHMENTS),
    {
      taskId,
      type,
      ...data,
      createdAt: serverTimestamp(),
    },
  );
  return attachmentRef.id;
};

export const getTaskGitHubAttachments = async (
  taskId: string,
): Promise<GitHubAttachment[]> => {
  const attachmentsRef = collection(db, COLLECTIONS.GITHUB_ATTACHMENTS);
  const q = query(attachmentsRef, where("taskId", "==", taskId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: timestampToDate(doc.data().createdAt),
  })) as GitHubAttachment[];
};

export const deleteGitHubAttachment = async (
  attachmentId: string,
): Promise<void> => {
  const attachmentRef = doc(db, COLLECTIONS.GITHUB_ATTACHMENTS, attachmentId);
  await deleteDoc(attachmentRef);
};
// ==========================================
