"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateRecord, deleteRecord } from "@/lib/firestore";
import type { NoteRecord } from "@/types";

const TYPE_STYLES: { [key: string]: { bg: string; text: string; label: string } } = {
  feedback: { bg: "bg-orange-100", text: "text-orange-600", label: "피드백" },
  idea: { bg: "bg-red-100", text: "text-red-500", label: "아이디어" },
  todo: { bg: "bg-green-100", text: "text-green-600", label: "할일" },
  log: { bg: "bg-indigo-100", text: "text-indigo-600", label: "로그" },
  cheatsheet: { bg: "bg-purple-100", text: "text-purple-600", label: "명령어" },
};

interface RecordItemProps {
  record: NoteRecord;
}

export default function RecordItem({ record }: RecordItemProps) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(record.content);
  const [showDelete, setShowDelete] = useState(false);

  const style = TYPE_STYLES[record.type] ?? TYPE_STYLES.log;
  const time = record.createdAt?.toDate
    ? new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(record.createdAt.toDate())
    : "";

  async function handleSave() {
    if (!user || !editContent.trim()) return;
    await updateRecord(user.uid, record.id, { content: editContent.trim() });
    setEditing(false);
  }

  async function handleDelete() {
    if (!user) return;
    await deleteRecord(user.uid, record.id);
  }

  async function handleToggleComplete() {
    if (!user || record.type !== "todo") return;
    await updateRecord(user.uid, record.id, { isCompleted: !record.isCompleted });
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-3 mb-2"
      onClick={() => !editing && setEditing(true)}
    >
      <div className="flex items-start gap-2">
        {/* 타입 배지 */}
        <span className={`${style.bg} ${style.text} text-xs font-bold px-2.5 py-1 rounded-full mt-0.5`}>
          {style.label}
        </span>

        <div className="flex-1 min-w-0">
          {/* 시간 */}
          <span className="text-xs text-gray-500 font-medium">{time}</span>

          {/* 내용 */}
          {editing ? (
            <div className="mt-1">
              <textarea
                autoFocus
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(false); }}
                  className="text-xs text-gray-500 px-3 py-1 border rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSave(); }}
                  className="text-xs text-white bg-indigo-500 px-3 py-1 rounded-lg"
                >
                  저장
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDelete(true); }}
                  className="text-xs text-red-500 px-3 py-1 border border-red-200 rounded-lg ml-auto"
                >
                  삭제
                </button>
              </div>
              {showDelete && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-2">이 기록을 삭제하시겠습니까?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDelete(false); }}
                      className="text-xs px-3 py-1 border rounded-lg"
                    >
                      취소
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                      className="text-xs text-white bg-red-500 px-3 py-1 rounded-lg"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className={`text-base text-gray-900 font-medium mt-1 whitespace-pre-wrap ${
              record.type === "todo" && record.isCompleted ? "line-through text-gray-400" : ""
            }`}>
              {record.content}
            </p>
          )}
        </div>

        {/* Todo 체크박스 */}
        {record.type === "todo" && !editing && (
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleComplete(); }}
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 ${
              record.isCompleted
                ? "bg-green-500 border-green-500"
                : "border-gray-300"
            }`}
          >
            {record.isCompleted && (
              <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
