import { Router } from 'express'
import auth from '../../middleware/auth.js';

// Controller
import ctrl from './controller.js'
const {registerUser, loginUser, refreshToken, logoutUser} = ctrl

const router = Router();

router.post('/api/auth/register', registerUser);
router.post('/api/auth/login', loginUser);
router.post('/api/auth/refresh-token', refreshToken);
router.get('/api/auth/logout', auth.ensureAuthenticated, logoutUser);

export default router;