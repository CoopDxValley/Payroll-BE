import Joi from "joi";

const createGrade = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    minSalary: Joi.number().positive().required(),
    maxSalary: Joi.number().positive().required().min(Joi.ref("minSalary")),
  }),
};

const updateGrade = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      minSalary: Joi.number().positive(),
      maxSalary: Joi.number().positive().min(Joi.ref("minSalary")),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const getGrade = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const deleteGrade = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

export default {
  createGrade,
  updateGrade,
  getGrade,
  deleteGrade,
};
