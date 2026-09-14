import { Router } from 'express';
import * as providerMessageController from '../controllers/provider_message_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { hasRole } from '../middlewares/role_middleware.js';

const router = Router();

// route publique pour envoyer un message à un prestataire
router.post('/providers/:id/messages', providerMessageController.sendMessage);

// routes pour prestataire ou admin lire les messages
router.get('/providers/:id/messages', isAuthenticated, hasRole('provider', 'organizer'), providerMessageController.getMessages);
router.get('/providers/:id/messages/unread-count', isAuthenticated, hasRole('provider', 'organizer'), providerMessageController.getUnreadCount);
router.patch('/providers/:id/messages/:msgId/read', isAuthenticated, hasRole('provider', 'organizer'), providerMessageController.markAsRead);
router.delete('/providers/:id/messages/:msgId', isAuthenticated, hasRole('provider', 'organizer'), providerMessageController.deleteMessage);

export default router;
