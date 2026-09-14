import { Router } from 'express';
import * as homeContentController from '../controllers/home_content_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { isOrganizer } from '../middlewares/role_middleware.js';

const router = Router();


router.get('/home-content', homeContentController.getAllContent);

router.get('/home-content/:language', homeContentController.getContentByLanguage);

router.post('/home-content', isAuthenticated, isOrganizer, homeContentController.updateContent);

export default router;
