import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canAccessModule } from "@/lib/auth/permissions";
import { MODULES } from "@/lib/auth/config";
import PdfEditor from "@/components/pdf/PdfEditor";

export default async function PdfPage() {
  const session = await auth();
  
  if (!canAccessModule(session?.user || null, MODULES.HERRAMIENTAS)) {
    redirect('/unauthorized');
  }

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Editor de PDF</h1>
        <p className="mt-1 text-gray-500">
          Sube un documento PDF, añade texto en cualquier lugar y descárgalo. El proceso es privado y ocurre íntegramente en tu navegador.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <PdfEditor />
      </div>
    </div>
  );
}
