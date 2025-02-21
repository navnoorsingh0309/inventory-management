import AuthTabSystem from "@/components/Auth/AuthTabSystem";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted relative overflow-hidden">
      <AuthTabSystem/>
    </div>
  );
}
