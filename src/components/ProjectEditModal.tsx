"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateProject } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import type { Project } from "@/types";

interface ProjectEditModalProps {
  project: Project;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <dt className="text-xs font-semibold text-gray-400 uppercase">{label}</dt>
      <dd className="text-base font-medium text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}

function InfoLink({ label, url }: { label: string; url: string }) {
  if (!url) return null;
  return (
    <div className="py-2">
      <dt className="text-xs font-semibold text-gray-400 uppercase">{label}</dt>
      <dd className="mt-0.5">
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-base font-medium text-indigo-500 hover:underline break-all">
          {url} ↗
        </a>
      </dd>
    </div>
  );
}

export default function ProjectEditModal({ project, onClose }: ProjectEditModalProps) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [techStack, setTechStack] = useState(project.techStack.join(", "));
  const [domain, setDomain] = useState(project.domain);
  const [domainRegistrar, setDomainRegistrar] = useState(project.domainRegistrar);
  const [domainExpiry, setDomainExpiry] = useState(
    project.domainExpiry?.toDate
      ? project.domainExpiry.toDate().toISOString().split("T")[0]
      : ""
  );
  const [repoUrl, setRepoUrl] = useState(project.repoUrl);
  const [deployUrl, setDeployUrl] = useState(project.deployUrl);
  const [logoBase64, setLogoBase64] = useState(project.logoBase64);
  const [startedAt, setStartedAt] = useState(
    project.startedAt?.toDate
      ? project.startedAt.toDate().toISOString().split("T")[0]
      : ""
  );
  const [saving, setSaving] = useState(false);

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setLogoBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  const startedAtDisplay = project.startedAt?.toDate
    ? new Intl.DateTimeFormat("ko-KR").format(project.startedAt.toDate())
    : "";

  const expiryDisplay = project.domainExpiry?.toDate
    ? new Intl.DateTimeFormat("ko-KR").format(project.domainExpiry.toDate())
    : "";

  const hasAnyInfo = project.description || project.techStack.length > 0 ||
    project.domain || project.repoUrl || project.deployUrl;

  async function handleSave() {
    if (!user || !title.trim()) return;
    setSaving(true);
    try {
      const tags = techStack.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
      await updateProject(user.uid, project.id, {
        title: title.trim(),
        description: description.trim(),
        techStack: tags,
        domain: domain.trim(),
        domainRegistrar: domainRegistrar.trim(),
        domainExpiry: domainExpiry ? Timestamp.fromDate(new Date(domainExpiry)) : null,
        repoUrl: repoUrl.trim(),
        deployUrl: deployUrl.trim(),
        logoBase64,
        startedAt: startedAt ? Timestamp.fromDate(new Date(startedAt)) : null,
      });
      setEditing(false);
      onClose();
    } catch {
      // TODO: error toast
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">프로젝트 정보</h2>
          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 text-sm font-semibold text-indigo-500 border border-indigo-300 rounded-lg hover:bg-indigo-50"
              >
                편집
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {editing ? (
          /* ===== 편집 모드 ===== */
          <>
            <div className="p-5 space-y-4">
              {/* 로고 */}
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  {logoBase64 ? (
                    <img src={`data:image/png;base64,${logoBase64}`} alt="로고"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-300" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-bold">
                      로고
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                </label>
                <div className="text-sm text-gray-500">
                  {logoBase64 ? (
                    <button onClick={() => setLogoBase64(null)} className="text-red-500 font-medium">로고 삭제</button>
                  ) : (
                    <span>탭하여 로고 추가</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">프로젝트 이름</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">설명</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  placeholder="프로젝트에 대한 간단한 설명"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">기술 스택</label>
                <input value={techStack} onChange={(e) => setTechStack(e.target.value)}
                  placeholder="Next.js, Firebase, Tailwind (쉼표로 구분)"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">프로젝트 시작일</label>
                <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">🌐 도메인 정보</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">도메인 주소</label>
                    <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">구입처 (등록 대행)</label>
                    <input value={domainRegistrar} onChange={(e) => setDomainRegistrar(e.target.value)} placeholder="GoDaddy, 가비아 등"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">만료 예정일</label>
                    <input type="date" value={domainExpiry} onChange={(e) => setDomainExpiry(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">🔗 링크</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">GitHub 레포</label>
                    <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">배포 URL</label>
                    <input value={deployUrl} onChange={(e) => setDeployUrl(e.target.value)} placeholder="https://myapp.vercel.app"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4 flex gap-3">
              <button onClick={() => setEditing(false)}
                className="flex-1 py-3 text-base font-bold text-gray-500 border border-gray-300 rounded-xl">
                취소
              </button>
              <button onClick={handleSave} disabled={!title.trim() || saving}
                className="flex-2 py-3 px-8 bg-indigo-500 text-white text-base font-bold rounded-xl disabled:opacity-30 hover:bg-indigo-600">
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </>
        ) : (
          /* ===== 보기 모드 ===== */
          <div className="p-5">
            {!hasAnyInfo ? (
              <p className="text-gray-400 text-center py-8">
                아직 등록된 정보가 없습니다.<br />
                "편집" 버튼을 눌러 정보를 추가하세요.
              </p>
            ) : (
              <dl className="divide-y divide-gray-100">
                {/* 로고 + 이름 */}
                <div className="py-2 flex items-center gap-3">
                  {project.logoBase64 ? (
                    <img src={`data:image/png;base64,${project.logoBase64}`} alt={project.title}
                      className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                      {project.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase">프로젝트 이름</dt>
                    <dd className="text-lg font-bold text-gray-900">{project.title}</dd>
                  </div>
                </div>
                <InfoRow label="설명" value={project.description} />
                <InfoRow label="시작일" value={startedAtDisplay} />
                {project.techStack.length > 0 && (
                  <div className="py-2">
                    <dt className="text-xs font-semibold text-gray-400 uppercase">기술 스택</dt>
                    <dd className="flex flex-wrap gap-1.5 mt-1">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="text-sm px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-semibold">
                          {tech}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                {project.domain && (
                  <div className="py-3 space-y-1">
                    <dt className="text-xs font-semibold text-gray-400 uppercase">🌐 도메인</dt>
                    <dd className="text-base font-bold text-gray-900">{project.domain}</dd>
                    {project.domainRegistrar && (
                      <dd className="text-sm text-gray-600">구입처: {project.domainRegistrar}</dd>
                    )}
                    {expiryDisplay && (
                      <dd className="text-sm text-gray-600">만료: {expiryDisplay}</dd>
                    )}
                  </div>
                )}

                <InfoLink label="GitHub" url={project.repoUrl} />
                <InfoLink label="배포 사이트" url={project.deployUrl} />
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
