import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { SellForm } from "./SellForm";

export default async function SellPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/register?callbackUrl=/sell&reason=sell");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit a tool for sale</h1>
          <p className="text-gray-500 text-sm mt-1">
            Complete all steps carefully. Submissions are reviewed within 24–48 hours.
            Incomplete or low-quality submissions will be rejected.
          </p>
        </div>
        <SellForm />
      </main>
    </div>
  );
}
