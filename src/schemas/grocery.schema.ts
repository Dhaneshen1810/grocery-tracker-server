import { z } from "zod";

export const GroceryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  expiryDate: z.string().datetime().optional(),
  done: z.boolean().optional(),
});

export type GroceryItemUpdateInput = z.infer<typeof GroceryItemSchema>;
export type GroceryItemInput = z.infer<typeof GroceryItemSchema>;
