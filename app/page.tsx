"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const loadConnectionFromStorage = useAppStore(
    (s) => s.loadConnectionFromStorage
  );
  const ngrokUrl = useAppStore((s) => s.ngrokUrl);

  useEffect(() => {
    loadConnectionFromStorage();
  }, [loadConnectionFromStorage]);

  useEffect(() => {
    if (ngrokUrl) {
      router.replace("/dashboard");
    } else {
      router.replace("/setup");
    }
  }, [ngrokUrl, router]);

  return (
    <div className="setup-page">
      <div className="spinner" />
    </div>
  );
}
