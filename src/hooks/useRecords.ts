"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeRecords } from "@/lib/firestore";
import type { NoteRecord, RecordType } from "@/types";

export function useRecords(
  projectId: string | null, // null = 전체, "inbox" = Inbox만
  filterType?: RecordType
) {
  const { user } = useAuth();
  const [records, setRecords] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeRecords(user.uid, projectId, (data) => {
      setRecords(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, projectId]);

  // 클라이언트 사이드 필터
  const filtered = filterType
    ? records.filter((r) => r.type === filterType)
    : records;

  return { records: filtered, loading };
}
