import express from 'express';
import { currentUser, loginUser, registerUser, forgotPassword, resetPassword } from '../controllers/userCotroller.js';
import { validateToken } from '../middleware/validateTokenHandler.js';

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.get('/current', validateToken, currentUser);

export default router;