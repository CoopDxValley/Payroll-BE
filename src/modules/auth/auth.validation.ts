import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const loginValidation = { body: loginSchema };
export const logoutValidation = { body: logoutSchema };
export const forgotPasswordValidation = { body: forgotPasswordSchema };
