import { Router } from 'express';
import * as statsController from '../controllers/stats_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { isOrganizer } from '../middlewares/role_middleware.js';

const router = Router();

router.get('/admin/stats/dashboard', isAuthenticated, isOrganizer, statsController.getDashboardSummary);
router.get('/admin/stats/stock', isAuthenticated, isOrganizer, statsController.getStockStats);
router.get('/admin/stats/visitors', isAuthenticated, isOrganizer, statsController.getVisitorStats);

export default router;
