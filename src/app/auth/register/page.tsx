import { RegisterForm } from "./RegisterForm";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="w-5 h-5 text-primary" />
            ai<span className="text-primary">hub</span>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">Join the AI creator community</p>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
