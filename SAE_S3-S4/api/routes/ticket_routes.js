import { Router } from 'express';
import * as ticketController from '../controllers/ticket_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { ensureSelfOrOrganizer } from '../middlewares/ownership_middleware.js';

const router = Router();



router.get('/tickets', ticketController.getAllTickets);

router.get('/tickets/:id', ticketController.getTicketById);

router.post('/panier/reserver', isAuthenticated, ticketController.createReservation);

router.post('/panier/annuler', isAuthenticated, ticketController.cancelReservation);


router.post('/orders/save', isAuthenticated, ticketController.saveOrder);

router.get('/orders/user/:userId', isAuthenticated, ensureSelfOrOrganizer('userId'), ticketController.getUserOrders);

export default router;
