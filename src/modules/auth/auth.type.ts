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
