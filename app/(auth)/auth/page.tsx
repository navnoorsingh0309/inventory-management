"use client"
import AuthTabSystem from "@/components/Auth/AuthTabSystem";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("v") || "signin";

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <AuthTabSystem tab={view} />
    </div>
  );
}
