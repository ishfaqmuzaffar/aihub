import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="w-5 h-5 text-primary" />
            ai<span className="text-primary">hub</span>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to share your creations</p>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
            <LoginForm />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground mt-4">
            No account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
