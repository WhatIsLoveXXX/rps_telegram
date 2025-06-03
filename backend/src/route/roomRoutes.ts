import express from 'express';
import { BattleController } from '../controller/roomController';

const router = express.Router();

router.post('/rooms/create', BattleController.createBattle);
router.get('/rooms/open', BattleController.findOpenBattles);
router.post('/rooms/join', BattleController.joinBattle);

export default router;
