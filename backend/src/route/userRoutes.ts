import express from 'express';
import { UserController } from '../controller/userController';

const router = express.Router();

router.post('/users/authorize', UserController.authorize);
router.get('/users/:id', UserController.getUserById);
router.post('/users/balance/topUp', UserController.topUpBalance);
router.post('/users/balance/withdraw', UserController.withdrawBalance);
router.post('/users/wallet', UserController.updateWallet);

export default router;