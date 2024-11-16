import { Router } from 'express'
import auth from '../middleware/auth.js';

// Controller
import ctrl from '../controllers/auth.controller.js'
import responds from '../red/responds.js';
const {registerUser, loginUser, refreshToken, logoutUser, changePassword} = ctrl

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: john.doe@example.com
 *               role:
 *                 type: string
 *                 enum: [admin, moderator, user]
 *                 description: User's role
 *                 example: user
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: P@ssw0rd!
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User registered successfully
 *       '409':
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Email already exists
 *       '422':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 422
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Validation error details
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Internal server error
 */

router.post('/api/auth/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: P@ssw0rd!
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 body:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john.doe@example.com
 *                         role:
 *                           type: string
 *                           example: user
 *                         accessToken:
 *                           type: string
 *                           example: JWT_ACCESS_TOKEN
 *                         refreshToken:
 *                           type: string
 *                           example: JWT_REFRESH_TOKEN
 *       '401':
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Email or password is invalid
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Internal server error
 */
router.post('/api/auth/login', loginUser);

router.get('/api/auth/verify-token', auth.ensureAuthenticated, (req, res) => {
    try {
        responds.success(req, res, {message: "Token is valid"}, 200);
    } catch (error) {
        responds.error(req, res, {message: error.message}, 400);
    }
})

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token using a refresh token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: JWT refresh token
 *                 example: JWT_REFRESH_TOKEN
 *     responses:
 *       '200':
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 body:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: NEW_JWT_ACCESS_TOKEN
 *                     newRefreshToken:
 *                       type: string
 *                       example: NEW_JWT_REFRESH_TOKEN
 *       '401':
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Refresh token invalid or expired
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Internal server error
 */
router.post('/api/auth/refresh-token', refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout the user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '204':
 *         description: User logged out successfully, no content returned
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 body:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Internal server error
 */
router.get('/api/auth/logout', auth.ensureAuthenticated, logoutUser);

router.patch('/api/auth/changePassword', auth.ensureAuthenticated, changePassword);

export default router;