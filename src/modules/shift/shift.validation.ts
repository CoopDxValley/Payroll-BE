import Joi from "joi";
// import { objectId } from "./custom.validation";

const createShift = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().required().min(Joi.ref("startTime")),
    breakTime: Joi.number().integer().min(0).required(),
    gracePeriod: Joi.number().integer().min(0).required(),
  }),
};

const updateShift = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      startTime: Joi.date().iso(),
      endTime: Joi.date().iso().min(Joi.ref("startTime")),
      breakTime: Joi.number().integer().min(0),
      gracePeriod: Joi.number().integer().min(0),
      isActive: Joi.boolean(),
    })
    .min(1),
};

export default {
  createShift,
  updateShift,
};
