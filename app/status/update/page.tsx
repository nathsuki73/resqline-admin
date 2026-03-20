"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { updateReportStatus } from "@/app/services/reports";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function StatusUpdatePage() {
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

        console.log(`📡 Cleaned ID: ${cleanId} | Code: ${code}`);

        // Now call the service with the cleaned ID
        await updateReportStatus(cleanId, parseInt(code));

        setStatus("success");
      } catch (err) {
        console.error("❌ Update failed:", err);
        setStatus("error");
      }
    };

    performUpdate();
  }, [id, code]); // Removed 'router' to prevent unnecessary re-runs

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d0d] p-6 text-center text-white">
      <div className="w-full max-w-sm rounded-2xl border border-[#262626] bg-[#1a1a1a] p-8 shadow-2xl">
        {status === "loading" && (
          <>
            <Loader2
              className="mx-auto mb-4 animate-spin text-[#f57c00]"
              size={48}
            />
            <h1 className="text-xl font-bold">Updating Status...</h1>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Synchronizing with ResqLine AI servers.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-[#43a047]" size={48} />
            <h1 className="text-xl font-bold">Status Updated</h1>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              The incident is now{" "}
              <strong>{code === "2" ? "Dispatched" : "Rejected"}</strong>.
            </p>
            <p className="mt-6 text-[10px] uppercase tracking-widest text-[#737373]">
              You may now close this tab.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="mx-auto mb-4 text-[#e53935]" size={48} />
            <h1 className="text-xl font-bold">Update Failed</h1>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Invalid ID or server connection error.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 w-full rounded-lg bg-[#262626] py-2 text-xs font-bold hover:bg-[#333]"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
