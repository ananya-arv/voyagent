import { z } from "zod";

// Intake form validation. Used by /api/generate-itinerary and the /plan form.
export const tripIntakeSchema = z
  .object({
    destination: z.string().trim().min(1, "Destination is required").max(120),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be YYYY-MM-DD"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be YYYY-MM-DD"),
    num_travelers: z.coerce.number().int().min(1).max(20),
    age: z.coerce.number().int().min(1).max(120),
    budget_tier: z.enum(["budget", "mid", "luxury"]),
    vibe: z.enum(["relaxed", "packed", "adventurous"]),
    dietary_notes: z.string().max(1000).optional().nullable(),
    must_haves: z.string().max(1000).optional().nullable(),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "end_date must be on or after start_date",
    path: ["end_date"],
  });

export type TripIntakeInput = z.infer<typeof tripIntakeSchema>;
