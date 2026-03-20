"use client";
import { useEffect, useState, Suspense } from "react"; // 1. Import Suspense
import { useSearchParams, useRouter } from "next/navigation";
import { updateReportStatus } from "@/app/services/reports";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// 2. Move your logic into a sub-component
function StatusUpdateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const id = searchParams.get("id");
  const code = searchParams.get("code");

  useEffect(() => {
    if (!id || !code) {
      setStatus("error");
      return;
    }

    const performUpdate = async () => {
      try {
        const cleanId = id.replace("RPT-2026-", "");
        await updateReportStatus(cleanId, parseInt(code));
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    performUpdate();
  }, [id, code]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d0d] p-6 text-center text-white">
      {/* ... keep your existing JSX here ... */}
    </div>
  );
}

// 3. The default export MUST be wrapped in Suspense
export default function StatusUpdatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d]">
          <Loader2 className="animate-spin text-[#f57c00]" size={48} />
        </div>
      }
    >
      <StatusUpdateContent />
    </Suspense>
  );
}
