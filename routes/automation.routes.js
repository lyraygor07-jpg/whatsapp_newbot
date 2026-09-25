import { Router } from 'express';
import { testAutomation } from '../controllers/automation.controller.js';

const router = Router();

router.get('/test', testAutomation);

export default router;