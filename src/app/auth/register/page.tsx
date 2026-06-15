import { RegisterForm } from "./RegisterForm";
import Link from "next/link";
import { Sparkles, TreePine, DollarSign } from "lucide-react";

export default function RegisterPage({ searchParams }: { searchParams: { reason?: string; callbackUrl?: string } }) {
  const isSeller = searchParams.reason === "sell";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
            <TreePine className="w-5 h-5 text-primary" />
            <span>AI<span className="text-primary">Forest</span></span>
          </Link>
          {isSeller ? (
            <>
              <div className="mt-4 mb-2 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Create a free account to start selling</h2>
              <p className="text-sm text-gray-500 mt-1">Join thousands of creators earning from their AI tools</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 mt-2 text-sm">Join the AI tools marketplace</p>
            </>
          )}
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <RegisterForm callbackUrl={searchParams.callbackUrl} />
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href={`/auth/login${searchParams.callbackUrl ? `?callbackUrl=${searchParams.callbackUrl}` : ""}`} className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
        {isSeller && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
            <div className="bg-white border rounded-lg p-2.5"><p className="font-bold text-gray-900 text-sm">80%</p><p>revenue share</p></div>
            <div className="bg-white border rounded-lg p-2.5"><p className="font-bold text-gray-900 text-sm">Free</p><p>to list</p></div>
            <div className="bg-white border rounded-lg p-2.5"><p className="font-bold text-gray-900 text-sm">24hr</p><p>review time</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
