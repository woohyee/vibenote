"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { addRecord } from "@/lib/firestore";
import type { RecordType } from "@/types";

const TYPES: { value: RecordType; label: string; icon: string; color: string; activeText: string }[] = [
  { value: "feedback", label: "피드백", icon: "💬", color: "bg-orange-500", activeText: "text-orange-600" },
  { value: "idea", label: "아이디어", icon: "💡", color: "bg-red-500", activeText: "text-red-500" },
  { value: "todo", label: "할일", icon: "✅", color: "bg-green-500", activeText: "text-green-600" },
  { value: "log", label: "로그", icon: "📝", color: "bg-indigo-500", activeText: "text-indigo-600" },
];

interface QuickCaptureProps {
  projectId?: string | null;
}

export default function QuickCapture({ projectId = null }: QuickCaptureProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [type, setType] = useState<RecordType>("log");
  const [sending, setSending] = useState(false);

  const currentType = TYPES.find((t) => t.value === type) ?? TYPES[3];

  async function handleSubmit() {
    if (!user || !content.trim()) return;

    setSending(true);
    try {
      await addRecord(user.uid, content.trim(), type, projectId);
      setContent("");
    } catch {
      // TODO: toast error
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="bg-white border-t-2 border-gray-200 px-4 py-3 safe-area-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      {/* 입력 영역 */}
      <div className="flex items-end gap-2">
        {/* 타입 선택 드롭다운 스타일 버튼 */}
        <div className="relative">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as RecordType)}
            className={`appearance-none ${currentType.color} text-white text-sm font-bold pl-3 pr-7 py-3 rounded-xl cursor-pointer focus:outline-none`}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/80 text-xs">
            ▼
          </div>
        </div>

        {/* 텍스트 입력 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            type === "feedback"
              ? "고객 피드백을 기록하세요..."
              : type === "idea"
              ? "떠오른 아이디어를 적으세요..."
              : type === "todo"
              ? "할 일을 입력하세요..."
              : "오늘 작업한 내용을 기록하세요..."
          }
          rows={1}
          className="flex-1 resize-none rounded-xl bg-gray-100 px-4 py-3 text-base text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
        />

        {/* 전송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || sending}
          className={`p-3 rounded-xl text-white disabled:opacity-30 transition-colors ${currentType.color} hover:opacity-90`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
