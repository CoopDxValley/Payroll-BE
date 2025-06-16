import Joi from "joi";

const createLeaveType = {
  body: Joi.object().keys({
    name: Joi.string().required().messages({
      "any.required": "Leave type name is required",
    }),
    description: Joi.string().optional().allow(null, ""),
    maxDaysYearly: Joi.number().integer().min(0).required().messages({
      "any.required": "Max days yearly is required",
      "number.base": "Max days yearly must be a number",
    }),
    isPaid: Joi.boolean().optional(),
    carryForward: Joi.boolean().optional(),
  }),
};

const updateLeaveType = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional().allow(null, ""),
    maxDaysYearly: Joi.number().integer().min(0).optional(),
    isPaid: Joi.boolean().optional(),
    carryForward: Joi.boolean().optional(),
  }),
};

export default {
  createLeaveType,
  updateLeaveType,
};
