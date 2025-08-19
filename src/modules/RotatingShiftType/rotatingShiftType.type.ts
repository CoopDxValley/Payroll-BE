// ==================== CORE TYPES ====================

export interface RotatingShiftType {
  id: string;
  companyId: string;
  name: string;
  startTime: string;  // Format: "HH:mm:ss"
  endTime: string;    // Format: "HH:mm:ss"
  duration: number;   // hours
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== REQUEST TYPES ====================

export interface CreateRotatingShiftTypeRequest {
  name: string;
  startTime: string;  // Format: "HH:mm:ss"
  endTime: string;    // Format: "HH:mm:ss"
}

export interface UpdateRotatingShiftTypeRequest {
  name?: string;
  startTime?: string;  // Format: "HH:mm:ss"
  endTime?: string;    // Format: "HH:mm:ss"
  isActive?: boolean;
}

// ==================== RESPONSE TYPES ====================

export interface RotatingShiftTypeWithRelations extends RotatingShiftType {
  company: {
    id: string;
    companyCode: string;
  };
  _count?: {
    employeeShiftAssignments: number;
  };
}

export interface RotatingShiftTypeWithAssignments extends RotatingShiftType {
  company: {
    id: string;
    companyCode: string;
  };
  employeeShiftAssignments: Array<{
    id: string;
    date: Date;
    hours: number;
    isApproved: boolean;
    employee: {
      id: string;
      name: string;
      username: string;
    };
    schedule?: {
      id: string;
      name: string;
    };
  }>;
}

// ==================== FILTER TYPES ====================

export interface RotatingShiftTypeFilters {
  isActive?: boolean;
  name?: string;
}

// ==================== SERVICE INTERFACES ====================

export interface IRotatingShiftTypeService {
  createRotatingShiftType(data: CreateRotatingShiftTypeRequest & { companyId: string }): Promise<RotatingShiftTypeWithRelations>;
  getRotatingShiftTypes(companyId: string, filters?: RotatingShiftTypeFilters): Promise<RotatingShiftTypeWithRelations[]>;
  getRotatingShiftTypeById(id: string, companyId: string): Promise<RotatingShiftTypeWithRelations>;
  updateRotatingShiftType(id: string, companyId: string, data: UpdateRotatingShiftTypeRequest): Promise<RotatingShiftTypeWithRelations>;
  deleteRotatingShiftType(id: string, companyId: string): Promise<{ message: string }>;
  deactivateRotatingShiftType(id: string, companyId: string): Promise<RotatingShiftTypeWithRelations>;
  activateRotatingShiftType(id: string, companyId: string): Promise<RotatingShiftTypeWithRelations>;
}

// ==================== VALIDATION TYPES ====================

export interface ValidationSchemas {
  createRotatingShiftType: any;
  updateRotatingShiftType: any;
  getRotatingShiftTypeById: any;
  deleteRotatingShiftType: any;
  deactivateRotatingShiftType: any;
  activateRotatingShiftType: any;
}

// ==================== UTILITY TYPES ====================

export interface TimeRange {
  startTime: string;  // Format: "HH:mm:ss"
  endTime: string;    // Format: "HH:mm:ss"
}

export interface ShiftTypeUsage {
  totalAssignments: number;
  approvedAssignments: number;
  pendingAssignments: number;
}

export interface ShiftTypeSummary {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  isActive: boolean;
  usage: ShiftTypeUsage;
} 