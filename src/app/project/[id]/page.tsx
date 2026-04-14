"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRecords } from "@/hooks/useRecords";
import { updateProject, deleteProject } from "@/lib/firestore";
import { onSnapshot, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import QuickCapture from "@/components/QuickCapture";
import RecordItem from "@/components/RecordItem";
import ProjectEditModal from "@/components/ProjectEditModal";
import type { Project, RecordType } from "@/types";

const FILTER_TABS: { value: RecordType | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "feedback", label: "피드백" },
  { value: "idea", label: "아이디어" },
  { value: "todo", label: "할일" },
  { value: "log", label: "로그" },
  { value: "cheatsheet", label: "명령어" },
];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<RecordType | "all">("all");
  const [showEdit, setShowEdit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filterType = filter === "all" ? undefined : filter;
  const { records, loading: recordsLoading } = useRecords(projectId, filterType);

  // 프로젝트 실시간 구독
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      doc(getDb(), "users", user.uid, "projects", projectId),
      (snap) => {
        if (snap.exists()) {
          setProject({ id: snap.id, ...snap.data() } as Project);
        }
      }
    );
    return unsubscribe;
  }, [user, projectId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  async function handleArchive() {
    if (!user || !project) return;
    const newStatus = project.status === "active" ? "archived" : "active";
    await updateProject(user.uid, projectId, { status: newStatus });
  }

  async function handleDelete() {
    if (!user) return;
    if (!confirm("이 프로젝트와 모든 기록을 삭제하시겠습니까?")) return;
    await deleteProject(user.uid, projectId);
    router.replace("/");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        {/* 앱 브랜딩 라인 */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <img src="/icon-192.png" alt="Vibe Note" className="w-9 h-9 rounded-lg" />
            <span className="text-base font-bold text-gray-500">VibeNote</span>
          </div>
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* 프로젝트 이름 라인 (← 뒤로가기 포함) */}
        <div className="flex items-center px-4 pb-2">
          <button onClick={() => router.back()} className="p-1 mr-1 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {project.title}
          </h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="ml-2 p-1 text-gray-400 hover:text-indigo-500 flex-shrink-0"
            title="기본 정보"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>


        {/* 메뉴 */}
        {showEdit && (
          <div className="px-4 pb-3 flex gap-2">
            <button
              onClick={() => { setShowEditModal(true); setShowEdit(false); }}
              className="text-sm px-3 py-1.5 bg-indigo-500 text-white rounded-lg font-semibold"
            >
              정보 수정
            </button>
            <button
              onClick={handleArchive}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 font-medium"
            >
              {project.status === "active" ? "보관" : "복구"}
            </button>
            <button
              onClick={handleDelete}
              className="text-xs px-3 py-1.5 border border-red-300 rounded-lg text-red-500"
            >
              삭제
            </button>
          </div>
        )}

        {/* 필터 탭 */}
        <div className="flex gap-1 px-4 pb-2 overflow-x-auto">
          {FILTER_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
                filter === t.value
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Timeline */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-40">
        {recordsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500">
              아직 기록이 없습니다. 시작해보세요!
            </p>
          </div>
        ) : (
          records.map((record) => (
            <RecordItem key={record.id} record={record} />
          ))
        )}
      </main>

      {/* Quick Capture */}
      <div className="fixed bottom-0 left-0 right-0">
        <QuickCapture projectId={projectId} />
      </div>

      {/* 프로젝트 정보 수정 모달 */}
      {showEditModal && (
        <ProjectEditModal
          project={project}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
