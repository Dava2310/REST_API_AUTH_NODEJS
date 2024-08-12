// --------------------
// External Dependencies
// --------------------
import { compare, hashSync } from 'bcrypt'; // Bcrypt for hashing and comparing passwords
import jwt from 'jsonwebtoken'; // JWT for generating and verifying JSON Web Tokens
import Joi from 'joi'; // Joi for schema validation

// --------------------
// Configuration
// --------------------
import config from '../../config.js'; // Configuration settings for the application

// --------------------
// Utility Modules
// --------------------
import responds from '../../red/responds.js'; // Utility functions for standardized API responses

// --------------------
// Database Models
// --------------------
import IT from '../../models/InvalidTokens.js' // Model for managing invalid tokens
import RT from '../../models/RefreshTokens.js' // Model for managing refresh tokens
import User from '../../models/UserModel.js'; // Model for managing user records

const invalidTokensModel = IT.invalidTokensModel; // Instance of the invalid tokens model
const refreshTokensModel = RT.refreshTokensModel; // Instance of the refresh tokens model
const UserModel = User.UserModel; // Instance of the user model

// Schema validation
import schema from '../../validations/userValidation.js'; // Schema for user input validation

/**
 * Registers a new user by validating input data, checking for email duplication,
 * encrypting the password, and inserting the user record into the database.
 *
 * @param {object} req - The request object containing the user registration data in the body.
 * @param {object} res - The response object used to send the success or error response.
 * @returns {Promise<void>} - Sends a success response if registration is successful or an error response if any issues occur.
 */
const registerUser = async (req, res) => {
    try {
        // Validate and extract user registration data from the request body
        const result = await schema.userRegister.validateAsync(req.body);

        // Check for existing user with the same email address
        if (await UserModel.findOneRecord({ email: result.email })) {
            // Respond with an error if the email already exists
            return responds.error(req, res, { message: 'Email already exists' }, 409);
        }

        // Encrypt the password using bcrypt before storing it
        const newPassword = hashSync(result.password, 10);

        // Construct a new user object with the registration details
        const newUser = {
            name: result.name,
            email: result.email,
            role: result.role,
            password: newPassword
        };

        // Insert the new user record into the database
        await UserModel.createRecord(newUser);

        // Respond with a success message upon successful registration
        return responds.success(req, res, { message: 'User registered successfully' }, 201);

    } catch (error) {
        // Handle validation errors specifically from Joi
        if (error instanceof Joi.ValidationError) {
            return responds.error(req, res, { message: error.details[0].message }, 422);
        }

        // Respond with a generic error message for other errors
        return responds.error(req, res, { message: error.message }, 500);
    }
};

/**
 * @function loginUser
 * @description Handles user login by validating credentials, generating JWTs, and returning tokens.
 * @param {Object} req - The request object containing the user's login credentials.
 * @param {Object} res - The response object used to send responses back to the client.
 * @returns {Object} - A response object indicating success or failure of the login attempt.
 */
const loginUser = async (req, res) => {
    try {
        // Validate login data
        const result = await schema.userLogin.validateAsync(req.body);

        // Check if user exists
        const user = await UserModel.findOneRecord({ email: result.email });
        if (!user) {
            return responds.error(req, res, { message: 'Email or password is invalid' }, 401);
        }

        // Verify password
        const passwordMatch = await compare(result.password, user.password);
        if (!passwordMatch) {
            return responds.error(req, res, { message: 'Email or password is invalid' }, 401);
        }

        // Generate access and refresh tokens
        const accessToken = jwt.sign(
            { userId: user.id },
            config.jwt.secret,
            {
                subject: 'accessApi',
                expiresIn: config.jwt.accessTokenExpiresIn
            }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            config.jwt.refresh_secret,
            {
                subject: 'refreshToken',
                expiresIn: config.jwt.refreshTokenExpiresIn
            }
        );

        // Store refresh token in database
        await refreshTokensModel.createRecord({ refreshToken, userId: user.id });

        // Respond with user data and tokens
        const data = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken,
            refreshToken
        };
        return responds.success(req, res, { data }, 200);

    } catch (error) {
        // Handle errors
        return responds.error(req, res, { message: error.message }, 500);
    }
};

/**
 * @function refreshToken
 * @description Handles the process of refreshing access tokens. It verifies the provided refresh token, generates new JWTs, and updates the refresh token in the database.
 * @param {Object} req - The request object containing the refresh token.
 * @param {Object} res - The response object used to send responses back to the client.
 * @returns {Object} - A response object with the new access and refresh tokens or an error message.
 */
const refreshToken = async (req, res) => {
    try {
        // Extract refresh token from request body
        const { refreshToken } = req.body;

        // Check if refresh token is provided
        if (!refreshToken) {
            return responds.error(req, res, { message: 'Refresh token not found' }, 401);
        }

        // Verify the provided refresh token
        const decodedRefreshToken = jwt.verify(refreshToken, config.jwt.refresh_secret);

        // Check if the refresh token exists in the database
        const userRefreshToken = await refreshTokensModel.findOneRecord({ refreshToken: refreshToken, userId: decodedRefreshToken.userId });
        if (!userRefreshToken) {
            return responds.error(req, res, { message: 'Refresh token invalid or expired' }, 401);
        }

        // Remove the old refresh token from the database
        await refreshTokensModel.deleteRecord({ id: userRefreshToken.id });

        // Generate new access token
        const accessToken = jwt.sign(
            { userId: decodedRefreshToken.userId },
            config.jwt.secret,
            {
                subject: 'accessApi',
                expiresIn: config.jwt.accessTokenExpiresIn
            }
        );

        // Generate a new refresh token
        const newRefreshToken = jwt.sign(
            { userId: decodedRefreshToken.userId },
            config.jwt.refresh_secret,
            {
                subject: 'refreshToken',
                expiresIn: config.jwt.refreshTokenExpiresIn
            }
        );

        // Store the new refresh token in the database
        const newToken = {
            refreshToken: newRefreshToken,
            userId: decodedRefreshToken.userId
        };
        await refreshTokensModel.createRecord(newToken);

        // Respond with new access and refresh tokens
        const data = {
            accessToken,
            newRefreshToken
        };
        return responds.success(req, res, data, 200);

    } catch (error) {
        // Handle token errors
        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            return responds.error(req, res, { message: 'Refresh token invalid or expired' }, 401);
        }

        // Handle other errors
        return responds.error(req, res, { message: error.message }, 500);
    }
};


/**
 * @function logoutUser
 * @description Handles the user logout process. It deletes all refresh tokens associated with the user and invalidates the current access token by adding it to the blacklist.
 * @param {Object} req - The request object containing user information and the access token.
 * @param {Object} res - The response object used to send responses back to the client.
 * @returns {Object} - A response object indicating the success of the logout operation or an error message.
 */
const logoutUser = async (req, res) => {
    try {
        // Delete all refresh tokens associated with the user
        await refreshTokensModel.deleteRecord({ userId: req.user.id });

        // Prepare data for invalidating the current access token
        const userInvalidToken = {
            accessToken: req.accessToken.value,
            userId: req.user.id,
            expirationTime: req.accessToken.exp
        };

        // Insert the access token into the blacklist to prevent further use
        await invalidTokensModel.createRecord(userInvalidToken);

        // Respond with a success message and a 204 No Content status code
        return responds.success(req, res, '', 204);

    } catch (error) {
        // Handle errors and respond with an error message and a 500 Internal Server Error status code
        return responds.error(req, res, { message: error.message }, 500);
    }
};
export default { registerUser, loginUser, refreshToken, logoutUser }