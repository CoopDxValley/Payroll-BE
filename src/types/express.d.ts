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
      employee?: AuthUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  employee: AuthUser;
}

interface SmsError extends Error {
  code?: string;
}

// types/express.d.ts or wherever your AuthUser is defined
