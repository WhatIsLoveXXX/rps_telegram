import express from 'express';
import { UserController } from '../../user/controller/userController';
import { LeaderboardController } from '../controller/leaderBoardController';

const router = express.Router();

router.get('/leaderboard', LeaderboardController.getLeaderboard);

export default router;
