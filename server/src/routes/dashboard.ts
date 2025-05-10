import express from 'express';
import { getDashboardOverview } from '../controllers/dashboard';

const router = express.Router();

router.get('/overview', getDashboardOverview);

export default router; 