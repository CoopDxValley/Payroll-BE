import { z } from "zod";
import { password, safeName, safeToken } from "../../validations/security";

export const loginSchema = z
  .object({
    username: safeName,
    password,
  })
  .strict();

export const logoutSchema = z
  .object({
    refreshToken: safeToken,
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
