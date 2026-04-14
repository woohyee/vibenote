import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin SDK 초기화 (서버 사이드)
function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return getFirestore();
}

export async function POST(request: NextRequest) {
  // API 키 검증
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.SYNC_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { uid, projectName, techStack, repoUrl, deployUrl, domain, description } = body;

    if (!uid || !projectName) {
      return NextResponse.json({ error: "uid and projectName required" }, { status: 400 });
    }

    const db = getAdminDb();
    const projectsRef = db.collection("users").doc(uid).collection("projects");

    // 같은 이름의 프로젝트가 있으면 업데이트, 없으면 생성
    const existing = await projectsRef.where("title", "==", projectName).limit(1).get();

    const projectData = {
      title: projectName,
      ...(techStack && { techStack }),
      ...(repoUrl && { repoUrl }),
      ...(deployUrl && { deployUrl }),
      ...(domain && { domain }),
      ...(description && { description }),
      lastUpdatedAt: new Date(),
    };

    let projectId: string;

    if (!existing.empty) {
      // 업데이트
      projectId = existing.docs[0].id;
      await projectsRef.doc(projectId).update(projectData);
    } else {
      // 새로 생성
      const newDoc = await projectsRef.add({
        ...projectData,
        status: "active",
        domainRegistrar: "",
        domainExpiry: null,
        logoBase64: null,
        createdAt: new Date(),
      });
      projectId = newDoc.id;
    }

    return NextResponse.json({ success: true, projectId, updated: !existing.empty });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
