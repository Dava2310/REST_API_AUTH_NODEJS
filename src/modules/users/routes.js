import { Router } from 'express'
import ctrl from './controller.js'
import auth from '../../middleware/auth.js';

const {viewUser, onlyAdmin, onlyAdminModerator} = ctrl

const router = Router();

router.get('/api/users/current', auth.ensureAuthenticated, viewUser);

router.get('/api/admin', auth.ensureAuthenticated, auth.authorize(['admin']), onlyAdmin)

router.get('/api/moderator', auth.ensureAuthenticated, auth.authorize(['admin', 'moderator']), onlyAdminModerator)

export default router;