import { Router } from 'express';
import * as ctrl from '../controllers/provider_product_controller.js';
import isAuthenticated from '../middlewares/auth_middleware.js';
import { hasRole, isProvider } from '../middlewares/role_middleware.js';
import { ensureProviderOwnsParamOrOrganizer } from '../middlewares/ownership_middleware.js';

const router = Router();

// routes publiques côté boutique
// tous les produits de tous les prestataires
router.get('/shop/products', ctrl.getAllShopProducts);

// un produit par id
router.get('/shop/products/:id', ctrl.getProductById);

// routes admin boutique
router.get('/admin/shop/products', isAuthenticated, hasRole('organizer'), ctrl.getAllShopProductsAdmin);
router.put('/admin/shop/products/:id', isAuthenticated, hasRole('organizer'), ctrl.updateAdminProduct);
router.delete('/admin/shop/products/:id', isAuthenticated, hasRole('organizer'), ctrl.deleteAdminProduct);

// routes prestataire authentifiées
// liste des produits d un prestataire
router.get('/providers/:providerId/products', isAuthenticated, hasRole('provider', 'organizer'), ensureProviderOwnsParamOrOrganizer('providerId'), ctrl.getProducts);

// créer un produit
router.post('/providers/:providerId/products', isAuthenticated, isProvider, ensureProviderOwnsParamOrOrganizer('providerId'), ctrl.createProduct);

// modifier un produit
router.put('/providers/:providerId/products/:productId', isAuthenticated, isProvider, ensureProviderOwnsParamOrOrganizer('providerId'), ctrl.updateProduct);

// supprimer un produit
router.delete('/providers/:providerId/products/:productId', isAuthenticated, isProvider, ensureProviderOwnsParamOrOrganizer('providerId'), ctrl.deleteProduct);

export default router;
