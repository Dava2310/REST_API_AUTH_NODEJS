// Help functions
import { compare, hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken'
import config from '../../config.js';
import responds from '../../red/responds.js';
import Joi from 'joi';

// Models
import IT from '../../models/InvalidTokens.js'
import RT from '../../models/RefreshTokens.js'
import User from '../../models/UserModel.js';

const invalidTokensModel = IT.invalidTokensModel
const refreshTokensModel = RT.refreshTokensModel
const UserModel = User.UserModel

// Schema validation
import schema from '../../validations/userValidation.js';

const registerUser = async (req, res) => {
    try {
        // Getting data from request and validating it
        const result = await schema.userRegister.validateAsync(req.body)

        // Checking for email duplication
        if (await UserModel.findOneRecord({ email: result.email })) {
            return responds.error(req, res, { message: 'Email already exists' }, 409)
        }

        // Encrypting password
        const newPassword = hashSync(result.password, 10);

        const newUser = {
            name: result.name,
            email: result.email,
            role: result.role,
            password: newPassword
        }

        // Inserting new User into DB
        await UserModel.createRecord(newUser)
        return responds.success(req, res, { message: 'User registered successfully' }, 201)

    } catch (error) {
        
        // Returning validations error
        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.details[0].message }, 422)
        }

        return responds.error(req, res, { message: error.message }, 500)
    }

}

const loginUser = async (req, res) => {
    try {

        // Getting data from the request and validating it
        const result = await schema.userLogin.validateAsync(req.body)

        // Searching if an user exists with this email
        const user = await UserModel.findOneRecord({ email: result.email });
        if (!user) {
            return responds.error(req, res, { message: 'Email or password is invalid' }, 401)
        }

        // Searching if the password matches with the user password registered in DB
        const passwordMatch = await compare(result.password, user.password);
        if (!passwordMatch) {
            return responds.error(req, res, { message: 'Email or password is invalid' }, 401)
        }

        // Generating JWT
        const accessToken = jwt.sign(
            // Data
            {
                userId: user.id
            },
            // Secret 
            config.jwt.secret,
            // Options 
            {
                subject: 'accessApi',
                expiresIn: config.jwt.accessTokenExpiresIn
            }
        )

        // Generating a refresh JWT
        const refreshToken = jwt.sign(
            // Data
            {
                userId: user.id
            },
            // Secret
            config.jwt.refresh_secret,
            {
                subject: 'refreshToken',
                expiresIn: config.jwt.refreshTokenExpiresIn
            }
        )

        // Generating new refresh token in Database
        const newToken = {
            refreshToken,
            userId: user.id
        }

        await refreshTokensModel.createRecord(newToken);

        const data = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken,
            refreshToken
        }

        return responds.success(req, res, { data }, 200)
    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500)
    }
}

const refreshToken = async (req, res) => {
    try {

        const { refreshToken } = req.body

        if (!refreshToken) {
            return responds.error(req, res, { message: 'Refresh token not found' }, 401)
        }

        const decodedRefreshToken = jwt.verify(refreshToken, config.jwt.refresh_secret)

        const userRefreshToken = await refreshTokensModel.findOneRecord({ refreshToken: refreshToken, userId: decodedRefreshToken.userId })

        if (!userRefreshToken) {
            return responds.error(req, res, { message: 'Refresh token invalid or expired' }, 401)
        }

        //await pool.query('DELETE FROM refreshTokens WHERE id = ?', [userRefreshToken.id])
        //await db.deleteRecord('refreshTokens', userRefreshToken.id)
        await refreshTokensModel.deleteRecord(userRefreshToken.id)

        // Generating JWT
        const accessToken = jwt.sign(
            // Data
            {
                userId: decodedRefreshToken.userId
            },
            // Secret 
            config.jwt.secret,
            // Options 
            {
                subject: 'accessApi',
                expiresIn: config.jwt.accessTokenExpiresIn
            }
        )

        // Generating a new refresh JWT
        const newRefreshToken = jwt.sign(
            // Data
            {
                userId: decodedRefreshToken.userId
            },
            // Secret
            config.jwt.refresh_secret,
            {
                subject: 'refreshToken',
                expiresIn: config.jwt.refreshTokenExpiresIn
            }
        )

        // Generating new refresh token in Database
        const newToken = {
            refreshToken: newRefreshToken,
            userId: decodedRefreshToken.userId
        }

        // await pool.query('INSERT INTO refreshTokens SET ?', [newToken]);
        // await db.createRecord('refreshTokens', newToken)
        await refreshTokensModel.createRecord(newToken)

        const data = {
            accessToken,
            newRefreshToken
        }

        return responds.success(req, res, data, 200)

    } catch (error) {

        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            return responds.error(req, res, { message: 'Refresh token invalid or expired' }, 401)
        }

        return responds.error(req, res, { message: error.message }, 500)
    }
}

const logoutUser = async (req, res) => {
    try {

        // Deleting all refresh tokens that are related to the user
        await refreshTokensModel.deleteRecord({userId: req.user.id})

        // Creating the data for the invalid acess token
        const userInvalidToken = {
            accessToken: req.accessToken.value,
            userId: req.user.id,
            expirationTime: req.accessToken.exp
        }

        // Inserting the access token in the black list
        await invalidTokensModel.createRecord(userInvalidToken)
        return responds.success(req, res, '', 204)

    } catch (error) {
        return responds.error(req, res, { message: error.message }, 500)
    }
}

export default { registerUser, loginUser, refreshToken, logoutUser }