import cron from 'node-cron';
import { GameHistoryService } from '../../game/service/gameHistoryService';

class LeaderBoardCleaner {
    static start() {
        cron.schedule('0 0 1 * *', async () => {
            console.log('[CRON] Cleaning game history...');
            await GameHistoryService.deleteGameHistory();
        });
    }
}

export default LeaderBoardCleaner;
