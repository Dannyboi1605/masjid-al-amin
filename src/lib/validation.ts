import type { z } from "zod";

export type FormState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

export function toFieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}
