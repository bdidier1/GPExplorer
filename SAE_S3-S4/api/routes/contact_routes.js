import { Router } from 'express';
import * as contactMessageController from '../controllers/contact_message_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { isOrganizer } from '../middlewares/role_middleware.js';

const router = Router();

// route publique pour envoyer un message de contact
router.post('/contact', contactMessageController.sendMessage);

// routes admin uniquement
router.get('/admin/messages', isAuthenticated, isOrganizer, contactMessageController.getMessages);
router.get('/admin/messages/unread-count', isAuthenticated, isOrganizer, contactMessageController.getUnreadCount);
router.patch('/admin/messages/:id/read', isAuthenticated, isOrganizer, contactMessageController.markAsRead);
router.delete('/admin/messages/:id', isAuthenticated, isOrganizer, contactMessageController.deleteMessage);

export default router;
