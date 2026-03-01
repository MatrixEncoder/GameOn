import { Router } from 'express';
import { GamesController } from './controller';

const router = Router();
const controller = new GamesController();

router.get('/', controller.listGames);
router.get('/:slug', controller.getGameBySlug);

export default router;
