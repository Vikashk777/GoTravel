const Joi = require("joi");

module.exports.ticketSchema = Joi.object({
    booking : Joi.object({
        name : Joi.string().required(),
        cityName : Joi.string().required(),
        person : Joi.number().required().min(0).max(10),
        mode : Joi.string().required().valid('cash')
        .valid('upi')
        .optional(),
        children : Joi.number().required().min(0).max(4),
    }).required(),
})