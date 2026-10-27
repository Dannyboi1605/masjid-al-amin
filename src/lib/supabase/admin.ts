import "server-only";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

const serviceKeySchema = z.string().min(1);

export function createAdminClient() {
  const serviceKey = serviceKeySchema.parse(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
