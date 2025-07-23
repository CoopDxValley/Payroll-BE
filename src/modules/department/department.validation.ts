import Joi from "joi";

const createDepartment = {
  body: Joi.object().keys({
    deptName: Joi.string().trim().required().messages({
      "any.required": "Department name is required",
      "string.empty": "Department name cannot be empty",
    }),
    location: Joi.string().trim().optional(),
    shorthandRepresentation: Joi.string().trim().optional(),
    companyId: Joi.string().guid({ version: "uuidv4" }).required().messages({
      "any.required": "Company ID is required",
      "string.guid": "Company ID must be a valid UUID",
    }),
  }),
};

export default {
  createDepartment,
};
