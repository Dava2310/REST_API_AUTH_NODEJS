import { Router } from 'express'
import ctrl from './controller.js'
import auth from '../../middleware/auth.js';

const {viewUser, onlyAdmin, onlyAdminModerator} = ctrl

const router = Router();

/**
 * @swagger
 * /api/users/current:
 *   get:
 *     summary: Get the current user
 *     description: Retrieve the current user's information
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/api/users/current', auth.ensureAuthenticated, viewUser);

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Access restricted to admin users
 *     description: Only accessible by users with the 'admin' role.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hello admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello admin
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - Access restricted to admin users
 *       500:
 *         description: Internal Server Error
 */
router.get('/api/admin', auth.ensureAuthenticated, auth.authorize(['admin']), onlyAdmin)

/**
 * @swagger
 * /api/moderator:
 *   get:
 *     summary: Access restricted to admin and moderator users
 *     description: Only accessible by users with the 'admin' or 'moderator' roles.
 *     tags:
 *       - Moderator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hello admin or moderator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello admin or moderator
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *       403:
 *         description: Forbidden - Access restricted to admin or moderator users
 *       500:
 *         description: Internal Server Error
 */
router.get('/api/moderator', auth.ensureAuthenticated, auth.authorize(['admin', 'moderator']), onlyAdminModerator)


export default router;