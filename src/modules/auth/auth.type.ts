import { z } from "zod";
import {
  loginSchema,
  logoutSchema,
  forgotPasswordSchema,
} from "./auth.validation";

export type LoginEmployeeInput = z.infer<typeof loginSchema>;
export type LogoutEmployeeInput = z.infer<typeof logoutSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export interface AuthEmployee {
  id: string;
  name: string;
  companyId: string;
  departmentId: string;
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      employee?: AuthEmployee;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  employee: AuthEmployee;
}

interface SmsError extends Error {
  code?: string;
}

export interface TokenResponse {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}
