import { Router } from 'express';
import * as providerController from '../controllers/provider_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { hasRole } from '../middlewares/role_middleware.js';
import { ensureProviderOwnsParamOrOrganizer } from '../middlewares/ownership_middleware.js';

const router = Router();



router.get('/providers', providerController.getAllProviders);

router.get('/providers/:id', providerController.getProviderById);

router.post('/providers', isAuthenticated, hasRole('organizer'), providerController.createProvider);

router.put('/providers/:id', isAuthenticated, hasRole('organizer'), providerController.updateProvider);

router.delete('/providers/:id', isAuthenticated, hasRole('organizer'), providerController.deleteProvider);

router.put('/providers/me/profile', isAuthenticated, hasRole('provider'), providerController.updateMyProviderProfile);

router.get('/providers/:providerId/guestbook', providerController.getGuestbookEntries);

router.post('/providers/:providerId/guestbook', isAuthenticated, hasRole('user', 'organizer'), providerController.addGuestbookEntry);
router.put('/providers/:providerId/guestbook/:entryId', isAuthenticated, hasRole('user', 'organizer'), providerController.updateGuestbookEntry);
router.delete('/providers/:providerId/guestbook/:entryId', isAuthenticated, hasRole('user', 'organizer'), providerController.deleteGuestbookEntry);

router.post('/providers/:providerId/visitors', providerController.incrementVisitors);
router.get('/providers/:providerId/visitors/stats', isAuthenticated, hasRole('provider', 'organizer'), ensureProviderOwnsParamOrOrganizer('providerId'), providerController.getProviderVisitorSummary);

export default router;
