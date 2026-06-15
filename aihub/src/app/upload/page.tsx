import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { UploadForm } from "./UploadForm";

export default async function UploadPage({ searchParams }: { searchParams: { remixFrom?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/upload");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Submit a tool</h1>
        <p className="text-gray-500 text-sm mb-8">Share your AI tool with thousands of business buyers. Listings are reviewed before going live.</p>
        <UploadForm remixFromId={searchParams.remixFrom} />
      </main>
    </div>
  );
}
