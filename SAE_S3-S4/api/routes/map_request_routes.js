import { Router } from 'express';
import * as mapRequestController from '../controllers/map_request_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { isProvider, isOrganizer } from '../middlewares/role_middleware.js';

const router = Router();

// côté prestataire soumettre une demande consulter la sienne annuler
router.post('/map-requests', isAuthenticated, isProvider, mapRequestController.submitRequest);
router.get('/map-requests/my', isAuthenticated, isProvider, mapRequestController.getMyRequest);
router.delete('/map-requests/my', isAuthenticated, isProvider, mapRequestController.removePendingRequests);

// côté admin voir toutes les demandes approuver rejeter
router.get('/admin/map-requests', isAuthenticated, isOrganizer, mapRequestController.getAllRequests);
router.patch('/admin/map-requests/:id/approve', isAuthenticated, isOrganizer, mapRequestController.approveRequest);
router.patch('/admin/map-requests/:id/reject', isAuthenticated, isOrganizer, mapRequestController.rejectRequest);

export default router;
