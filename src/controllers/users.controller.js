import responds from '../red/responds.js';

// --------------------
// Prisma Module
// --------------------
import prisma from '../../prisma/prismaClient.js'

// --------------------
// External Dependencies
// --------------------
import Joi from "joi";

// Schema
import Schemas from '../validations/userValidation.js'
const schema = Schemas.userEdit;

const getUsers = async (req, res) => {

    try {
        const allUsuarios = await prisma.usuario.findMany();
        return responds.success(req, res, { data: allUsuarios }, 200);
    }
    catch (error) {
        return responds.error(req, res, {message: error.message}, 500);
    }
}


const getOneUser = async (req, res) => {

    try {
        const { userId } = req.params;

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: userId
            }
        });

        if (!usuario) {
            return responds.error(req, res, { message: 'Usuario no encontrado.' }, 404);
        }

        return responds.success(req, res, { data: usuario }, 200);
    } catch (error) {
        // Respond with a generic error message for other errors
        return responds.error(req, res, { message: error.message }, 500);
    }

}

/**
 * Retrieve the authenticated user's information.
 * 
 * This function retrieves the current user's information based on their JWT authentication.
 * If the user is not found, it returns an error response.
 * 
 * @param {Object} req - Express request object containing user info after authentication
 * @param {Object} res - Express response object to send the result
 * @returns {Object} - JSON response with user data or an error message
 */
const viewUser = async (req, res) => {
    try {
        // Getting user after authentication with JWT
        const user = await prisma.usuario.findFirst({
            where: {
                id: req.user.id
            }
        })

        if (!user) {
            return responds.error(req, res, { message: 'No fue encontrado el usuario. Intente de nuevo.' }, 401);
        }

        // Returning data from this current user
        const data = {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            cargo: user.cargo
        };

        return responds.success(req, res, { data }, 200);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const editUser = async (req, res) => {
    try {
        
        const { userId } = req.params;

        // Searching for the user
        const user = await prisma.usuario.findUnique({where: {id: userId}});

        if (!user) {
            return responds.error(req, res, {message: 'Usuario no encontrado.'}, 404);
        }

        // Validating the request body
        const result = await schema.validateAsync(req.body);
        
        // Searching for duplicated email
        const duplicatedEmail = await prisma.usuario.findUnique({
            where: {
                email: result.email,
                NOT: { id: userId }
            }
        });

        if (duplicatedEmail) {
            return responds.error(req, res, { message: 'Este email ya está en uso.' }, 409);
        }

        // Making the update
        const updatedUser = await prisma.usuario.update({
            where: { id: userId },
            data: result
        });

        // Return the updated productor
        return responds.success(req, res, { data: updatedUser, message: "Usuario actualizado de forma exitosa."}, 200);

    } catch (error) {

        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.message }, 422)
        }

        return res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const usuario = await prisma.usuario.findUnique({
            where: {
                id: userId
            }
        });

        if (!usuario) {
            return responds.error(req, res, { message: 'Usuario no encontrado.' }, 404);
        }
        
        // Tenemos que verificar que el usuario no este intentando eliminar su propio usuario
        if (req.user.id === userId) {
            return responds.error(req, res, { message: 'No puede eliminar su propio usuario.' }, 403);
        }

        // Primero tenemos que eliminar todos los invalid tokens y refresh tokens que tienen ese ID de usuario
        await prisma.invalidToken.deleteMany({
            where: {
                userId: userId
            }
        });

        await prisma.refreshToken.deleteMany({
            where: {
                userId: userId
            }
        });

        await prisma.usuario.delete({
            where: {
                id: userId
            }
        })

        // Return the updated productor
        return responds.success(req, res, { message: "Usuario eliminado con éxito." }, 200);
    } catch (error) {
        // Respond with a generic error message for other errors
        return responds.error(req, res, { message: error.message }, 500);
    }
}

export default { viewUser, editUser, deleteUser, getUsers, getOneUser };

