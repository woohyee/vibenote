"use client";

import Link from "next/link";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow active:scale-[0.98]">
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
