import { Router } from 'express';
import userRoutes from './user';
import courseRoutes from './course';
import exerciseRoutes from './exercise';
import recommendRoutes from './recommend';

const router = Router();

router.use('/user', userRoutes);
router.use('/course', courseRoutes);
router.use('/exercise', exerciseRoutes);
router.use('/recommend', recommendRoutes);

export default router; 