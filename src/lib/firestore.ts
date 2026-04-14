import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocs,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { Project, NoteRecord, ProjectStatus, RecordType, Priority } from "@/types";

// === Helper ===

function projectsRef(uid: string) {
  return collection(getDb(), "users", uid, "projects");
}

function recordsRef(uid: string) {
  return collection(getDb(), "users", uid, "records");
}

function toProject(id: string, data: DocumentData): Project {
  return { id, ...data } as Project;
}

function toRecord(id: string, data: DocumentData): NoteRecord {
  return { id, ...data } as NoteRecord;
}

// === Projects ===

export function subscribeProjects(
  uid: string,
  status: ProjectStatus,
  callback: (projects: Project[]) => void
) {
  const q = query(
    projectsRef(uid),
    where("status", "==", status),
    orderBy("lastUpdatedAt", "desc")
  );
  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    callback(snapshot.docs.map((doc) => toProject(doc.id, doc.data())));
  });
}

export async function addProject(uid: string, title: string, logoBase64: string | null = null) {
  await addDoc(projectsRef(uid), {
    title,
    description: "",
    techStack: [],
    domain: "",
    domainRegistrar: "",
    domainExpiry: null,
    repoUrl: "",
    deployUrl: "",
    status: "active",
    logoBase64,
    startedAt: null,
    lastUpdatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export async function updateProject(
  uid: string,
  projectId: string,
  data: Partial<Omit<Project, "id">>
) {
  await updateDoc(doc(projectsRef(uid), projectId), {
    ...data,
    lastUpdatedAt: serverTimestamp(),
  });
}

export async function deleteProject(uid: string, projectId: string) {
  const batch = writeBatch(getDb());

  // 프로젝트에 연결된 records 삭제
  const recordsQuery = query(
    recordsRef(uid),
    where("projectId", "==", projectId)
  );
  const recordsSnapshot = await getDocs(recordsQuery);
  recordsSnapshot.docs.forEach((recordDoc) => {
    batch.delete(recordDoc.ref);
  });

  // 프로젝트 삭제
  batch.delete(doc(projectsRef(uid), projectId));

  await batch.commit();
}

// === Records ===

export function subscribeRecords(
  uid: string,
  projectId: string | null, // null = 전체, "inbox" = Inbox만
  callback: (records: NoteRecord[]) => void
) {
  let q;
  if (projectId === "inbox") {
    q = query(
      recordsRef(uid),
      where("projectId", "==", null),
      orderBy("createdAt", "desc")
    );
  } else if (projectId) {
    q = query(
      recordsRef(uid),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(recordsRef(uid), orderBy("createdAt", "desc"));
  }

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    callback(snapshot.docs.map((doc) => toRecord(doc.id, doc.data())));
  });
}

export async function addRecord(
  uid: string,
  content: string,
  type: RecordType,
  projectId: string | null = null,
  priority: Priority = "medium"
) {
  await addDoc(recordsRef(uid), {
    content,
    type,
    projectId,
    isCompleted: false,
    priority,
    command: type === "cheatsheet" ? content : null,
    createdAt: serverTimestamp(),
  });

  // 프로젝트 lastUpdatedAt 갱신
  if (projectId) {
    await updateDoc(doc(projectsRef(uid), projectId), {
      lastUpdatedAt: serverTimestamp(),
    });
  }
}

export async function updateRecord(
  uid: string,
  recordId: string,
  data: Partial<Omit<NoteRecord, "id">>
) {
  await updateDoc(doc(recordsRef(uid), recordId), data);
}

export async function deleteRecord(uid: string, recordId: string) {
  await deleteDoc(doc(recordsRef(uid), recordId));
}

export async function moveRecordToProject(
  uid: string,
  recordId: string,
  projectId: string
) {
  await updateDoc(doc(recordsRef(uid), recordId), { projectId });
  await updateDoc(doc(projectsRef(uid), projectId), {
    lastUpdatedAt: serverTimestamp(),
  });
}
