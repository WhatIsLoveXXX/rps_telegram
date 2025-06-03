import { Request, Response } from 'express';
import {BattleService} from "../service/roomService";

export class BattleController {
    static async createBattle(req: Request, res: Response) {
        const userId = res.locals.initData?.user?.id;
        const { betAmount } = req.body;

        try {
            const Battle = await BattleService.createBattleWithUser(userId, BigInt(betAmount));
            res.status(201).json({ BattleId: Battle.id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Could not create Battle' });
        }
    }

    static async findOpenBattles(req: Request, res: Response) {
        try {
            const Battles = await BattleService.findOpenBattles();
            res.json(Battles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Could not fetch Battles' });
        }
    }

    static async joinBattle(req: Request, res: Response) {
        const userId = res.locals.initData?.user?.id;
        const { BattleId } = req.body;

        if (!BattleId || typeof BattleId !== 'number') {
            return res.status(400).json({ error: 'Invalid or missing BattleId' });
        }

        try {
            // await BattleService.joinBattle(PoolClient, BattleId, BigInt(userId));
            res.json({ message: 'Joined Battle', BattleId });
        } catch (error: any) {
            console.error(error);
            const status = error.message === 'Battle is full' ? 400 : 500;
            res.status(status).json({ error: error.message || 'Could not join Battle' });
        }
    }
}