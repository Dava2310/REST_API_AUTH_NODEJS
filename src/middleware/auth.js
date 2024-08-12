import jwt from 'jsonwebtoken'
import config from '../config.js'
import responds from '../red/responds.js'

// Models
import User from '../models/UserModel.js'
import invalidTokens from '../models/InvalidTokens.js'
const UserModel = User.UserModel
const invalidTokensModel = invalidTokens.invalidTokensModel

// Middleware to ensure authentication with JWT
const ensureAuthenticated = async (req, res, next) => {

    // Getting access token from request headers
    const accessToken = req.headers.authorization
    if (!accessToken) {
        return responds.error(req, res, {message: 'Access token not found'}, 401);
    }

    // Checking if this accessToken is in blacklist
    const check = await invalidTokensModel.findOneRecord({accessToken: accessToken})
    //return responds.success(req, res, check, 200);

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