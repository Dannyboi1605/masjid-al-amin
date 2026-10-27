import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/types/database";

type AuditInput = {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Json | null;
};

export async function writeAudit(input: AuditInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("audit_log").insert({
    actor_id: input.actorId,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId ?? null,
    meta: input.meta ?? null,
  });

  if (error) {
    console.error("Failed to write audit log.", error.message);
  }
}

export type AuditRow = Database["public"]["Tables"]["audit_log"]["Row"];
