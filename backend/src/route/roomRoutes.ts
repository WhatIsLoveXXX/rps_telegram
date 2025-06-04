import express from 'express';
import { RoomController } from '../controller/roomController';

const router = express.Router();

router.post('/rooms/create', RoomController.createRoom);
router.get('/rooms/open', RoomController.findOpenRooms);
router.post('/rooms/join', RoomController.joinRoom); 

export default router;
