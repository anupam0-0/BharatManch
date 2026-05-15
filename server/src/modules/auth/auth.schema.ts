import { z } from "zod";

export const signInSchema = z.object({
  email: z.email().max(100),
  password: z.string().min(6).max(54),
});

export const signUpSchema = z.object({
  firstName: z.string().min(2).max(54),
  lastName: z.string().min(2).max(54),
  handle: z.string().min(6).max(54),
  email: z.email().max(100),
  password: z.string().min(6).max(54),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
