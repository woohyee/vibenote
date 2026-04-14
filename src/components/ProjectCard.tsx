"use client";

import Link from "next/link";
import type { Project } from "@/types";

const PASTEL_COLORS = [
  "bg-indigo-50 border-indigo-100",
  "bg-rose-50 border-rose-100",
  "bg-amber-50 border-amber-100",
  "bg-emerald-50 border-emerald-100",
  "bg-sky-50 border-sky-100",
  "bg-purple-50 border-purple-100",
  "bg-orange-50 border-orange-100",
  "bg-teal-50 border-teal-100",
];

function getColorByTitle(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const colorClass = getColorByTitle(project.title);

  return (
    <Link href={`/project/${project.id}`}>
      <div className={`${colorClass} rounded-xl border p-4 hover:shadow-md transition-shadow active:scale-[0.98]`}>
        <div className="flex items-center gap-3">
          {/* 로고 또는 이니셜 */}
          {project.logoBase64 ? (
            <img
              src={`data:image/png;base64,${project.logoBase64}`}
              alt={project.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {project.title.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">
              {project.title}
            </h3>

          </div>

          {/* 화살표 */}
          <svg
            className="w-5 h-5 text-gray-300 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
