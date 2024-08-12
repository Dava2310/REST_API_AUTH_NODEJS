import Joi from "joi";

const userRegister = Joi.object({

    // Name
    name: Joi.string().min(3).max(50).required(),
    
    // Email
    email: Joi.string().email().lowercase().required(),
    
    // Role
    role: Joi.string().valid(...['admin','moderator','user']).required(),
    
    // Password
    password: Joi.string().min(8).required(),

})

const userLogin = Joi.object({
    // Email
    email: Joi.string().email().lowercase().required(),

    // Password
    password: Joi.string().min(8).required(),
});

export default {userRegister, userLogin};