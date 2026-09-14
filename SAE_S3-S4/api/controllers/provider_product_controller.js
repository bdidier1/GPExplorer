/* controller provider product
 * gère les requêtes http des produits prestataires
 */
import * as providerProductService from '../services/provider_product_service.js';

/* get /api/providers/:providerId/products
 * liste les produits d un prestataire
 */
async function getProducts(req, res) {
    try {
        const { providerId } = req.params;
        const products = await providerProductService.getProductsByProvider(providerId);
        res.json({ error: 0, data: products });
    } catch (error) {
        console.error('Erreur getProducts:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/shop/products
 * liste tous les produits de tous les prestataires boutique publique
 */
async function getAllShopProducts(req, res) {
    try {
        const products = await providerProductService.getAllProducts();
        res.json({ error: 0, data: products });
    } catch (error) {
        console.error('Erreur getAllShopProducts:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/admin/shop/products
 * récupère tous les produits pour l'administration
 */
async function getAllShopProductsAdmin(req, res) {
    try {
        const products = await providerProductService.getAllProductsAdmin();
        res.json({ error: 0, data: products });
    } catch (error) {
        console.error('Erreur getAllShopProductsAdmin:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* get /api/shop/products/:id
 * récupère un produit par id public
 */
async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const product = await providerProductService.getProductById(id);
        if (!product) {
            return res.status(404).json({ error: 1, message: 'Produit introuvable' });
        }
        res.json({ error: 0, data: product });
    } catch (error) {
        console.error('Erreur getProductById:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* post /api/providers/:providerId/products
 * crée un produit prestataire authentifié
 */
async function createProduct(req, res) {
    try {
        const { providerId } = req.params;
        const result = await providerProductService.createProduct(providerId, req.body);

        if (!result.success) {
            return res.status(400).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, data: result.product, message: 'Produit créé' });
    } catch (error) {
        console.error('Erreur createProduct:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* put /api/providers/:providerId/products/:productId
 * met à jour un produit
 */
async function updateProduct(req, res) {
    try {
        const { providerId, productId } = req.params;
        const result = await providerProductService.updateProduct(providerId, productId, req.body);

        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, data: result.product, message: 'Produit modifié' });
    } catch (error) {
        console.error('Erreur updateProduct:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* delete /api/providers/:providerId/products/:productId
 * supprime un produit
 */
async function deleteProduct(req, res) {
    try {
        const { providerId, productId } = req.params;
        const result = await providerProductService.deleteProduct(providerId, productId);

        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, message: result.message });
    } catch (error) {
        console.error('Erreur deleteProduct:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* put /api/admin/shop/products/:id
 * met à jour un produit pour l'administration
 */
async function updateAdminProduct(req, res) {
    try {
        const { id } = req.params;
        const result = await providerProductService.updateProductAdmin(id, req.body);

        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, data: result.product, message: 'Produit modifié' });
    } catch (error) {
        console.error('Erreur updateAdminProduct:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

/* delete /api/admin/shop/products/:id
 * supprime un produit pour l'administration
 */
async function deleteAdminProduct(req, res) {
    try {
        const { id } = req.params;
        const result = await providerProductService.deleteProductAdmin(id);

        if (!result.success) {
            return res.status(404).json({ error: 1, message: result.message });
        }

        res.json({ error: 0, data: result.product, message: 'Produit supprimé' });
    } catch (error) {
        console.error('Erreur deleteAdminProduct:', error);
        res.status(500).json({ error: 1, message: 'Erreur serveur' });
    }
}

export {
    getProducts,
    getAllShopProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllShopProductsAdmin,
    updateAdminProduct,
    deleteAdminProduct
};
