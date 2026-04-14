import { Timestamp } from "firebase/firestore";

export type RecordType =
  | "feedback"
  | "idea"
  | "todo"
  | "log"
  | "cheatsheet";

export type Priority = "high" | "medium" | "low";

export type ProjectStatus = "active" | "archived";

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  domain: string;
  domainRegistrar: string;
  domainExpiry: Timestamp | null;
  repoUrl: string;
  deployUrl: string;
  status: ProjectStatus;
  logoBase64: string | null;
  startedAt: Timestamp | null;
  lastUpdatedAt: Timestamp;
  createdAt: Timestamp;
}

export interface NoteRecord {
  id: string;
  content: string;
  type: RecordType;
  projectId: string | null; // null = Inbox
  isCompleted: boolean;
  priority: Priority;
  command: string | null; // cheatsheet용
  createdAt: Timestamp;
}

// Firestore에 저장할 때 id 제외
export type ProjectData = Omit<Project, "id">;
export type RecordData = Omit<NoteRecord, "id">;
