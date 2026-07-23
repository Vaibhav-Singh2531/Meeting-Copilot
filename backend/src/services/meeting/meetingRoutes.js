import express from 'express';
import { createMeeting, getMeeting, endMeeting } from './meetingController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.post('/create', createMeeting);
router.get('/:roomCode', getMeeting);
router.patch('/:roomCode/end', endMeeting);

export default router;
