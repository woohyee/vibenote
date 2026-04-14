"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import { useRecords } from "@/hooks/useRecords";
import { addProject } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import QuickCapture from "@/components/QuickCapture";
import type { ProjectStatus } from "@/types";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<ProjectStatus>("active");
  const { projects, loading: projectsLoading } = useProjects(tab);
  const { records: inboxRecords } = useRecords("inbox");
  const [showNewProject, setShowNewProject] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLogo, setNewLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setNewLogo(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleAddProject() {
    if (!user || !newTitle.trim()) return;
    await addProject(user.uid, newTitle.trim(), newLogo);
    setNewTitle("");
    setNewLogo(null);
    setShowNewProject(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icon-192.png" alt="Vibe Note" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold text-gray-900">Vibe Note</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewProject(true)}
              className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab */}
        <div className="flex mt-3 bg-gray-100 rounded-lg p-1">
          {(["active", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === s ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"
              }`}
            >
              {s === "active" ? "진행중" : "보관함"}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-40">
        {/* Inbox */}
        {inboxRecords.length > 0 && tab === "active" && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-orange-600 mb-2">
              Inbox ({inboxRecords.length})
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              {inboxRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="text-sm text-gray-700 py-1 truncate">
                  <span className="text-orange-500 font-medium mr-1">
                    {record.type.toUpperCase()}
                  </span>
                  {record.content}
                </div>
              ))}
              {inboxRecords.length > 3 && (
                <p className="text-xs text-orange-400 mt-1">
                  +{inboxRecords.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* New Project */}
        {showNewProject && (
          <div className="mb-4 bg-white rounded-xl border-2 border-indigo-300 p-4 shadow-md">
            <label className="block text-sm font-bold text-gray-700 mb-2">새 프로젝트</label>

            {/* 로고 선택 */}
            <div className="flex items-center gap-3 mb-3">
              <label className="cursor-pointer">
                {newLogo ? (
                  <img src={`data:image/png;base64,${newLogo}`} alt="로고"
                    className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-300" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-bold">
                    로고
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
              </label>
              {newLogo && (
                <button onClick={() => setNewLogo(null)} className="text-xs text-red-500 font-medium">삭제</button>
              )}
            </div>

            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
              placeholder="프로젝트 이름을 입력하세요"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 py-3 text-base font-bold text-gray-600 rounded-xl border-2 border-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleAddProject}
                disabled={!newTitle.trim()}
                className="flex-1 py-3 text-base font-bold bg-indigo-500 text-white rounded-xl disabled:opacity-30"
              >
                생성
              </button>
            </div>
          </div>
        )}

        {/* Project List */}
        {projectsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🚀</div>
            <p className="text-gray-500">
              {tab === "active" ? "프로젝트가 없습니다. 새로 만들어보세요!" : "보관된 프로젝트가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>

      {/* Quick Capture */}
      <div className="fixed bottom-0 left-0 right-0">
        <QuickCapture />
      </div>
    </div>
  );
}
