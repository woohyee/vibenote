"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeProjects } from "@/lib/firestore";
import type { Project, ProjectStatus } from "@/types";

export function useProjects(status: ProjectStatus = "active") {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeProjects(user.uid, status, (data) => {
      setProjects(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, status]);

  return { projects, loading };
}
