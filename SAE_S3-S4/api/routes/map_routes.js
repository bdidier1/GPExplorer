import { Router } from 'express';
import * as mapController from '../controllers/map_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { isOrganizer } from '../middlewares/role_middleware.js';
import { ensureCanAssignMap } from '../middlewares/ownership_middleware.js';

const router = Router();



router.get('/map/locations', mapController.getAllLocations);

router.get('/map/locations/free', mapController.getFreeLocations);

router.get('/map/locations/:id', mapController.getLocationById);

router.post('/map/locations', isAuthenticated, isOrganizer, mapController.createLocation);

router.put('/map/locations/:id', isAuthenticated, isOrganizer, mapController.updateLocation);

router.delete('/map/locations/:id', isAuthenticated, isOrganizer, mapController.deleteLocation);

router.put('/map/locations/:id/assign', isAuthenticated, ensureCanAssignMap, mapController.assignProvider);

router.post('/map/locations/swap', isAuthenticated, isOrganizer, mapController.swapProviders);

router.get('/map/zones/:zone', mapController.getLocationsByZone);

export default router;
