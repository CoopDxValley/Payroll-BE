import Joi from 'joi';

const createAttendance = {
  body: Joi.object().keys({
    checkTime: Joi.date().required().messages({
      "any.required": "Check time is required",
      "date.base": "Check time must be a valid date",
    }),
    checkType: Joi.string().valid("I", "O").optional(),
    verifyMode: Joi.number().optional(),
    workCode: Joi.number().optional(),
    sensorId: Joi.string().optional(),
    deviceIp: Joi.string().ip({ version: "ipv4" }).optional(),
  }),
};

export default {
  createAttendance,
};
