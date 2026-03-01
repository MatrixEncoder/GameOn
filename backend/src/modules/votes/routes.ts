import { Router } from 'express';
import { VotesController } from './controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { voteDto } from './dto';

const router = Router();
const controller = new VotesController();

router.post('/', authenticate, validate(voteDto), controller.vote);

export default router;
