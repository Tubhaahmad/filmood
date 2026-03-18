import { z } from "zod";

//  Login Schema

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"), // Must be a proper email format

  password: z.string().min(1, "Password is required"), // Can't be empty (no length check for login — the account already exists)
});

// Signup Schema

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be 50 characters or less"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Attach the error to the confirmPassword field
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
