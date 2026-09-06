import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const reportInput = z.object({
  location: z.string().trim().min(2).max(120),
  reportType: z.string().trim().min(2).max(80),
  severity: z.enum(["critical", "amber", "clear"]),
  note: z.string().trim().max(500).optional(),
});

export const createCleanupReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => reportInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: report, error } = await context.supabase
      .from("cleanup_reports")
      .insert({
        user_id: context.userId,
        location: data.location,
        report_type: data.reportType,
        severity: data.severity,
        note: data.note || null,
      })
      .select("id, location, report_type, severity, note, status, created_at")
      .single();

    if (error) throw new Error(error.message);
    return report;
  });