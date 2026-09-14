import { Router } from 'express';
import * as usersController from '../controllers/users_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { hasRole } from '../middlewares/role_middleware.js';

const router = Router();



router.get('/users/me', isAuthenticated, usersController.getCurrentUser);
router.put('/users/me', isAuthenticated, usersController.updateCurrentUser);

router.get('/users', isAuthenticated, hasRole('organizer'), usersController.getAllUsers);

router.get('/users/:id', isAuthenticated, hasRole('organizer'), usersController.getUserById);

router.post('/users', isAuthenticated, hasRole('organizer'), usersController.createUser);

router.put('/users/:id', isAuthenticated, hasRole('organizer'), usersController.updateUser);

router.delete('/users/:id', isAuthenticated, hasRole('organizer'), usersController.deleteUser);

export default router;
