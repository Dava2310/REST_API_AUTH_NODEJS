import jwt from 'jsonwebtoken'
import config from '../config.js'
import responds from '../red/responds.js'

// Models
import User from '../models/UserModel.js'
import invalidTokens from '../models/InvalidTokens.js'
const UserModel = User.UserModel
const invalidTokensModel = invalidTokens.invalidTokensModel

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

    // Getting access token from request headers
    const accessToken = req.headers.authorization
    if (!accessToken) {
        return responds.error(req, res, {message: 'Access token not found'}, 401);
    }

    // Checking if this accessToken is in blacklist
    const check = await invalidTokensModel.findOneRecord({accessToken: accessToken})

    if (check) {
        return responds.error(req, res, {message: 'Access token invalid', code: 'AccessTokenInvalid'}, 401)
    }


    try {
        const decodedAccessToken = jwt.verify(accessToken, config.jwt.secret);

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
            return responds.error(req, res, {message: 'Access token expired', code: 'AccessTokenExpired'}, 401)
        } else if (error instanceof jwt.JsonWebTokenError) {
            return responds.error(req, res, {message: 'Access token invalid', code: 'AccessTokenInvalid'}, 401)
        } else {
            return responds.error(req, res, {message: error.message}, 500)
        }

    }
}


// Middleware to ensure authorization by user roles
const authorize = (roles = []) => {
    return async function (req, res, next) {
        const user = await UserModel.findOneRecord({id: req.user.id});

        if (!user || !roles.includes(user.role)) {
            return responds.error(req, res, {message: 'Access denied'}, 403)
        }

        next();
    }
}

export default {ensureAuthenticated, authorize};