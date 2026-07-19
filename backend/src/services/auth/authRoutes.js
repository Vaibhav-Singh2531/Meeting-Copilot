import express from 'express';
import { loginOrRegister, refresh, logout } from './authController.js';

const router = express.Router();

router.post('/login', loginOrRegister);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
