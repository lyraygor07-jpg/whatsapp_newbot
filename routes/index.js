import { Router } from 'express';
import automationRoutes from './automation.routes.js';

const router = Router();

router.use('/automation', automationRoutes);

export default router;