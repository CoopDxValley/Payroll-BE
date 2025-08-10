import { z } from "zod";
import { safeName } from "../../validations/security";

export const loginSchema = z
  .object({
    username: safeName,
    password: safeName,
  })
  .strict();

export const logoutSchema = z
  .object({
    refreshToken: safeName,
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    username: safeName,
  })
  .strict();

export const loginValidation = { body: loginSchema };
export const logoutValidation = { body: logoutSchema };
export const forgotPasswordValidation = { body: forgotPasswordSchema };
