import express from 'express';
import { 
  loginOrRegister, 
  refresh, 
  logout, 
  googleRedirect, 
  googleCallback, 
  getMe 
} from './authController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/login', loginOrRegister);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Google OAuth Routes
router.get('/google/redirect', googleRedirect);
router.get('/google/callback', googleCallback);

// Protected routes
router.get('/me', protect, getMe);

export default router;
