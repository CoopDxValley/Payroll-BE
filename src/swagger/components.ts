// src/swagger/components.ts

export const components = {
  schemas: {
    Grade: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string", example: "Junior Developer" },
        minSalary: { type: "number", example: 30000 },
        maxSalary: { type: "number", example: 50000 },
        companyId: { type: "string", format: "uuid" },
        isActive: { type: "boolean", example: true },
      },
      required: ["name", "minSalary", "maxSalary", "companyId"],
    },
    ErrorResponse: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};
