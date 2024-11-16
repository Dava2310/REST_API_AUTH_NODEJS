import Joi from "joi";

const userRegister = Joi.object({

    // Name
    nombre: Joi.string().min(3).max(50).required(),
    
    // Last Name
    apellido: Joi.string().min(3).max(99).required(),

    // Email
    email: Joi.string().email().lowercase().required(),
    
    // Role
    cargo: Joi.string().valid(...['admin',  'moderador',  'user']).required(),

    // Password
    password: Joi.string()
        .min(8)
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
        .messages({
            'string.min': 'La contraseña debe tener al menos 8 caracteres.',
            'string.pattern.base': 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
            'any.required': 'La contraseña es obligatoria.'
        }),

})

const userEdit = Joi.object({
    // Name
    nombre: Joi.string().min(3).max(50).required(),
    
    // Last Name
    apellido: Joi.string().min(3).max(99).required(),

    // Email
    email: Joi.string().email().lowercase().required(),
    
    // Role
    cargo: Joi.string().valid(...['admin','user', 'moderador']).required(),
})

const userLogin = Joi.object({
    // Email
    email: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
            'string.email': 'El correo electrónico debe ser un correo válido.',
            'any.required': 'El correo electrónico es obligatorio.'
        }),

    // Password
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos 8 caracteres.',
            'any.required': 'La contraseña es obligatoria.'
        }),
});

const changePassword = Joi.object({

    // Current password
    currentPassword: Joi.string()
       .min(8)
       .required()
       .messages({
            'string.min': 'La contraseña debe tener al menos 8 caracteres.',
            'any.required': 'La contraseña es obligatoria.'
        }),

    // New password
    newPassword: Joi.string()
       .min(8)
       .required()
       .messages({
            'string.min': 'La contraseña debe tener al menos 8 caracteres.',
            'any.required': 'La contraseña es obligatoria.'
        }),


    // Confirm password
    confirmPassword: Joi.string()
       .min(8)
       .required()
       .valid(Joi.ref('newPassword'))
       .messages({
            'string.min': 'La contraseña debe tener al menos 8 caracteres.',
            'any.required': 'La contraseña es obligatoria.',
            'any.valid': 'La contraseña de confirmación no coincide con la nueva contraseña.'
        }),
})

export default {userRegister, userLogin, userEdit, changePassword};