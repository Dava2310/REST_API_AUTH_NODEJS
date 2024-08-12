import { Router } from 'express'
import ctrl from './controller.js'
import auth from '../../middleware/auth.js';

const {viewUser, onlyAdmin, onlyAdminModerator, allUsers} = ctrl

const router = Router();

router.get('/api/users/current', auth.ensureAuthenticated, viewUser);

router.get('/api/admin', auth.ensureAuthenticated, auth.authorize(['admin']), onlyAdmin)

router.get('/api/moderator', auth.ensureAuthenticated, auth.authorize(['admin', 'moderator']), onlyAdminModerator)

router.get('/api/allusers', auth.ensureAuthenticated, auth.authorize(['admin', 'moderator', 'user']), allUsers)

export default router;