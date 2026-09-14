/* service providerproduct
 * gère la logique métier des produits prestataires
 */
import { ProviderProduct, Provider, OrderItem } from '../models/index.js';

const SUPPORTED_LANGUAGES = ['fr', 'en', 'es'];

function normalizeI18nMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }

    const normalized = {};
    for (const lang of SUPPORTED_LANGUAGES) {
        const entry = value[lang];
        if (typeof entry === 'string') {
            const trimmed = entry.trim();
            if (trimmed) {
                normalized[lang] = trimmed;
            }
        }
    }

    return normalized;
}

function mergeI18nMap(currentValue, incomingValue) {
    const merged = { ...normalizeI18nMap(currentValue) };

    if (!incomingValue || typeof incomingValue !== 'object' || Array.isArray(incomingValue)) {
        return merged;
    }

    for (const lang of SUPPORTED_LANGUAGES) {
        if (!Object.hasOwn(incomingValue, lang)) {
            continue;
        }

        const raw = incomingValue[lang];
        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            if (trimmed) {
                merged[lang] = trimmed;
            } else {
                delete merged[lang];
            }
        } else {
            delete merged[lang];
        }
    }

    return merged;
}

function pickLegacyText(i18nMap, legacyText = '') {
    for (const lang of SUPPORTED_LANGUAGES) {
        if (i18nMap[lang]) {
            return i18nMap[lang];
        }
    }

    if (typeof legacyText === 'string') {
        const trimmed = legacyText.trim();
        if (trimmed) {
            return trimmed;
        }
    }

    return '';
}

function nullableI18nMap(i18nMap) {
    return Object.keys(i18nMap).length ? i18nMap : null;
}

function normalizeProductForWrite(data, currentProduct = null) {
    const currentTitleI18n = normalizeI18nMap(currentProduct?.titleI18n);
    const currentDescriptionI18n = normalizeI18nMap(currentProduct?.descriptionI18n);

    const nextTitleI18n = Object.hasOwn(data, 'titleI18n')
        ? mergeI18nMap(currentTitleI18n, data.titleI18n)
        : currentTitleI18n;

    const nextDescriptionI18n = Object.hasOwn(data, 'descriptionI18n')
        ? mergeI18nMap(currentDescriptionI18n, data.descriptionI18n)
        : currentDescriptionI18n;

    const nextTitle = pickLegacyText(nextTitleI18n, data.title ?? currentProduct?.title);
    const nextDescription = pickLegacyText(nextDescriptionI18n, data.description ?? currentProduct?.description) || null;

    return {
        title: nextTitle,
        titleI18n: nullableI18nMap(nextTitleI18n),
        description: nextDescription,
        descriptionI18n: nullableI18nMap(nextDescriptionI18n)
    };
}

/* récupère tous les produits d'un prestataire */
async function getProductsByProvider(providerId) {
    return await ProviderProduct.findAll({
        where: { providerId, isActive: true },
        order: [['createdAt', 'DESC']]
    });
}

/* récupère un produit par id */
async function getProductById(productId) {
    return await ProviderProduct.findByPk(productId);
}

/* récupère tous les produits actifs pour la boutique */
async function getAllProducts() {
    return await ProviderProduct.findAll({
        where: { isActive: true },
        include: [{
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'category', 'logo']
        }],
        order: [['createdAt', 'DESC']]
    });
}

/* récupère tous les produits pour l'administration */
async function getAllProductsAdmin() {
    return await ProviderProduct.findAll({
        include: [{
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'category', 'logo', 'isActive']
        }],
        order: [['createdAt', 'DESC']]
    });
}

/* crée un nouveau produit */
async function createProduct(providerId, data) {
    // vérifie que le prestataire existe
    const provider = await Provider.findByPk(providerId);
    if (!provider) {
        return { success: false, message: 'Prestataire introuvable' };
    }

    const normalized = normalizeProductForWrite(data);
    const title = normalized.title;
    const description = normalized.description;

    if (!title) {
        return { success: false, message: 'Le titre est requis (fr, en ou es).' };
    }

    const product = await ProviderProduct.create({
        providerId,
        title,
        titleI18n: normalized.titleI18n,
        description,
        descriptionI18n: normalized.descriptionI18n,
        price: data.price,
        stock: data.stock || 0,
        sold: 0,
        category: data.category || null,
        image: data.image || null,
        tags: data.tags || [],
        isActive: true
    });

    return { success: true, product };
}

/* met à jour un produit pour l'administration */
async function updateProductAdmin(productId, data) {
    const product = await ProviderProduct.findByPk(productId);

    if (!product) {
        return { success: false, message: 'Produit introuvable' };
    }

    const normalized = normalizeProductForWrite(data, product);

    if (!normalized.title) {
        return { success: false, message: 'Le titre est requis (fr, en ou es).' };
    }

    await product.update({
        title: normalized.title,
        titleI18n: normalized.titleI18n,
        description: normalized.description,
        descriptionI18n: normalized.descriptionI18n,
        price: data.price ?? product.price,
        stock: data.stock ?? product.stock,
        category: data.category ?? product.category,
        image: data.image ?? product.image,
        tags: data.tags ?? product.tags
    });

    return { success: true, product };
}

/* supprime un produit pour l'administration (suppression physique) */
async function deleteProductAdmin(productId) {
    const product = await ProviderProduct.findByPk(productId);

    if (!product) {
        return { success: false, message: 'Produit introuvable' };
    }

    const linkedOrderItems = await OrderItem.count({ where: { productId } });
    if (linkedOrderItems > 0) {
        return {
            success: false,
            message: 'Impossible de supprimer physiquement ce produit car il est lié à des commandes.'
        };
    }

    await product.destroy();

    return { success: true };
}

/* met à jour un produit */
async function updateProduct(providerId, productId, data) {
    const product = await ProviderProduct.findOne({
        where: { id: productId, providerId }
    });

    if (!product) {
        return { success: false, message: 'Produit introuvable' };
    }

    const normalized = normalizeProductForWrite(data, product);

    if (!normalized.title) {
        return { success: false, message: 'Le titre est requis (fr, en ou es).' };
    }

    await product.update({
        title: normalized.title,
        titleI18n: normalized.titleI18n,
        description: normalized.description,
        descriptionI18n: normalized.descriptionI18n,
        price: data.price ?? product.price,
        stock: data.stock ?? product.stock,
        category: data.category ?? product.category,
        image: data.image ?? product.image,
        tags: data.tags ?? product.tags,
        isActive: data.isActive ?? product.isActive
    });

    return { success: true, product };
}

/* supprime un produit en suppression physique */
async function deleteProduct(providerId, productId) {
    const product = await ProviderProduct.findOne({
        where: { id: productId, providerId }
    });

    if (!product) {
        return { success: false, message: 'Produit introuvable' };
    }

    const linkedOrderItems = await OrderItem.count({ where: { productId } });
    if (linkedOrderItems > 0) {
        return {
            success: false,
            message: 'Impossible de supprimer physiquement ce produit car il est lié à des commandes.'
        };
    }

    await product.destroy();
    return { success: true, message: 'Produit supprimé' };
}

/* décrémente le stock d'un produit pendant une commande
 * retourne { success, product?, message? }
 */
async function decrementStock(productId, quantity, transaction = null) {
    const opts = transaction ? { transaction, lock: transaction.LOCK.UPDATE } : {};
    const product = await ProviderProduct.findByPk(productId, opts);

    if (!product) {
        return { success: false, message: `Produit introuvable: ${productId}` };
    }

    const available = product.stock - product.sold;
    if (quantity > available) {
        return {
            success: false,
            message: `Stock insuffisant pour « ${product.title} » (${available} restant${available > 1 ? 's' : ''}, ${quantity} demandé${quantity > 1 ? 's' : ''})`
        };
    }

    await product.update(
        { sold: product.sold + quantity },
        transaction ? { transaction } : {}
    );

    return { success: true, product };
}

export {
    getProductsByProvider,
    getProductById,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin,
    updateProductAdmin,
    deleteProductAdmin,
    decrementStock
};
