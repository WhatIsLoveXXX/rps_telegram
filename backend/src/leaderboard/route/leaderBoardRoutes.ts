import express from 'express';
import { UserController } from '../../user/controller/userController';

const router = express.Router();

router.get('/leaderboard', UserController.authorize);

export default router;
