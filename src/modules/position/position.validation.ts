import Joi from "joi";

const createPosition = {
  body: Joi.object().keys({
    positionName: Joi.string().trim().required().messages({
      "any.required": "Position name is required",
      "string.empty": "Position name cannot be empty",
    }),
    description: Joi.string().trim().optional(),
  }),
};

const updatePosition = {
  body: Joi.object()
    .keys({
      positionName: Joi.string().trim().optional().messages({
        "string.empty": "Position name cannot be empty",
      }),
      description: Joi.string().trim().optional(),
      companyId: Joi.string().guid({ version: "uuidv4" }).optional().messages({
        "string.guid": "Company ID must be a valid UUID",
      }),
      isActive: Joi.boolean().optional(),
    })
    .min(1)
    .messages({
      "object.min": "At least one field must be updated",
    }),
};

const getOrDeletePosition = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: "uuidv4" }).required().messages({
      "any.required": "Position ID is required",
      "string.guid": "Position ID must be a valid UUID",
    }),
  }),
};

export default {
  createPosition,
  updatePosition,
  getOrDeletePosition,
};
