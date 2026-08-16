"use client";

import { useRouter } from "next/navigation";
import { CreateCaseForm } from "@/components/CreateCaseForm";

interface CreatedCase {
  id: string;
}

export default function NewCasePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create new incident case</h1>
          <p className="mt-2 text-gray-600">
            Create the case in this window. After submission, it opens directly for workflow decisions and tracking.
          </p>
        </div>

        <CreateCaseForm
          onSuccess={(caseData) => {
            const createdCase = caseData as CreatedCase;
            router.push(`/case/${createdCase.id}`);
          }}
        />
      </div>
    </main>
  );
}
