'use strict';

var base = module.superModule;
var Logger = require('dw/system/Logger');

function getAllCategories(product) {
    if (product) {
        try {
            var categoriesArray = [];
            var categoriesIterator = product.allCategories.iterator();
            while (categoriesIterator.hasNext()) {
                var category = categoriesIterator.next();
                categoriesArray.push(category.ID);
            }
            return categoriesArray;
        } catch(e) {
            Logger.error('Error in getAllCategories function in fullProduct model: {0}', e.toString());
        }
    }
    return [];
}

function getMasterId(product) {
    if (product) {
        try {
            if (!product.master && product.variationModel.master) {
                return product.variationModel.master.ID;
            } else {
                return product.ID;
            }
        } catch(e) {
            Logger.error('Error in getMasterId function in fullProduct model: {0}', e.toString());
        }
    }
    return null;
}

function getPrimaryCategory(product) {
    if (product) {
        try {
            if (!product.master && product.variationModel.master && product.variationModel.master.primaryCategory) {
                return product.variationModel.master.primaryCategory.ID;
            } else {
                return null;
            }
        } catch(e) {
            Logger.error('Error in getPrimaryCategory function in fullProduct model: {0}', e.toString());
        }
    }
    return null;
}

function getSubcategory(categories, primaryCategory) {
    if (categories.length && primaryCategory) {
        try {
            for (var category of categories) {
                if (category !== primaryCategory) {
                    return category;
                }
            }
        } catch(e) {
            Logger.error('Error in getSubcategory function in fullProduct model: {0}', e.toString());
        }
    }
    return null;
}

/**
 * Decorate product with full product information
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {Object} options - Options passed in from the factory
 * @property {dw.catalog.ProductVarationModel} options.variationModel - Variation model returned by the API
 * @property {Object} options.options - Options provided on the query string
 * @property {dw.catalog.ProductOptionModel} options.optionModel - Options model returned by the API
 * @property {dw.util.Collection} options.promotions - Active promotions for a given product
 * @property {number} options.quantity - Current selected quantity
 * @property {Object} options.variables - Variables passed in on the query string
 *
 * @returns {Object} - Decorated product model
 */
module.exports = function fullProduct(product, apiProduct, options) {
    base.call(this, product, apiProduct, options);

    if (apiProduct) {
        try {
            var allCategories = getAllCategories(apiProduct);
            var primaryCategory = apiProduct.primaryCategory ? apiProduct.primaryCategory.ID : getPrimaryCategory(apiProduct);

            product.allCategories = allCategories;
            product.creationDate = apiProduct.creationDate;
            product.masterId = getMasterId(apiProduct);
            product.primaryCategory = primaryCategory;
            product.subcategory = getSubcategory(allCategories, primaryCategory);
            product.variationModel = apiProduct.variationModel;
        } catch(e) {
            Logger.error('Error in fullProduct model: {0}', e.toString());
        }
    }

    return product;
};
