import Joi from "joi";

const create = {
  body: Joi.object().keys({
    name: Joi.string().trim().required().messages({
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty",
    }),
    type: Joi.string().valid("AMOUNT", "PERCENT").required().messages({
      "any.only": "Type must be AMOUNT or PERCENT",
      "any.required": "Type is required",
    }),
  }),
};

const update = {
  params: Joi.object().keys({
    id: Joi.string().guid().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().trim().optional(),
    type: Joi.string().valid("AMOUNT", "PERCENT").optional(),
  }),
};

const getById = {
  params: Joi.object().keys({
    id: Joi.string().guid().required(),
  }),
};

export default {
  create,
  update,
  getById,
};
