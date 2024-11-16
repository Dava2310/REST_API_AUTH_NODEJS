import jwt from 'jsonwebtoken'
import config from '../config.js'
import responds from '../red/responds.js'
import { PrismaClient } from '@prisma/client'

// Models
import User from '../models/UserModel.js'
import invalidTokens from '../models/InvalidTokens.js'
const UserModel = User.UserModel
const invalidTokensModel = invalidTokens.invalidTokensModel

const prisma = new PrismaClient();

// Middleware to ensure authentication with JWT
/**
 * Middleware to ensure authentication with JWT.
 * This function verifies the access token provided in the request headers.
 * If the token is valid, it adds user information to the request object.
 * If the token is invalid or expired, it returns an appropriate error response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 *
 * @returns {void}
 */
const ensureAuthenticated = async (req, res, next) => {

    try {

        // Getting access token from request headers
        const accessToken = req.headers.authorization

        if (!accessToken) {
            return responds.error(req, res, { message: 'Access token not found' }, 401);
        }

        let token;

        if (accessToken.startsWith('Bearer ')) {
            token = accessToken.split(' ')[1];
        } else {
            token = accessToken;
        }

        // Checking if this accessToken is in blacklist
        // const check = await invalidTokensModel.findOneRecord({accessToken: token})
        const check = await prisma.invalidToken.findFirst({
            where: {
                accessToken: token
            }
        })

        if (check) {
            return responds.error(req, res, { message: 'Access token invalid', code: 'AccessTokenInvalid' }, 401)
        }

        const decodedAccessToken = jwt.verify(token, config.jwt.secret);

        // Adding user object to the request with information provided by jwt
        // Remember: Don't include critical information
        req.accessToken = {
            value: accessToken,
            exp: decodedAccessToken.exp
        }
        req.user = {
            id: decodedAccessToken.userId
        }

        next();
    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            return responds.error(req, res, { message: 'Access token expired', code: 'AccessTokenExpired' }, 401)
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.log('error there')
            return responds.error(req, res, { message: 'Access token invalid', code: 'AccessTokenInvalid' }, 401)
        } else {
            return responds.error(req, res, { message: error.message }, 500)
        }

    }
}


// Middleware to ensure authorization by user roles
const authorize = (cargos = []) => {
    return async function (req, res, next) {

        try {
            //const user = await UserModel.findOneRecord({id: req.user.id});
            const user = await prisma.usuario.findUnique({
                where: {
                    id: req.user.id
                }
            })

            if (!user || !cargos.includes(user.cargo)) {
                return responds.error(req, res, { message: 'Usted no cuenta con este nivel de modificación.' }, 403)
            }

            next();
        } catch (error) {
            return responds.error(req, res, { message: error.message }, 500)
        }
    }
}

export default { ensureAuthenticated, authorize };