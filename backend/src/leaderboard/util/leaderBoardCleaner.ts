import cron from 'node-cron';
import { SeasonService } from '../../game/service/SeasonService';

class LeaderBoardCleaner {
    static start() {
        cron.schedule('0 0 1 * *', async () => {
            console.log('[CRON] Cleaning game history...');
            await SeasonService.archiveTopUsersAndClearHistory();
        });
    }
}

export default LeaderBoardCleaner;
