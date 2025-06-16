export interface AuthUser {
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
      user?: AuthUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

interface SmsError extends Error {
  code?: string;
}

// types/express.d.ts or wherever your AuthUser is defined
