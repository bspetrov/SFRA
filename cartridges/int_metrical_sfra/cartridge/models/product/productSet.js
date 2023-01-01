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
            Logger.error('Error in getAllCategories function in productSet model: {0}', e.toString());
        }
    }
    return [];
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
            Logger.error('Error in getSubcategory function in productSet model: {0}', e.toString());
        }
    }
    return null;
}

/**
 * Decorate product with set product information
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {Object} options - Options passed in from the factory
 * @property {dw.catalog.ProductVarationModel} options.variationModel - Variation model returned by the API
 * @property {Object} options.options - Options provided on the query string
 * @property {dw.catalog.ProductOptionModel} options.optionModel - Options model returned by the API
 * @property {dw.util.Collection} options.promotions - Active promotions for a given product
 * @property {number} options.quantity - Current selected quantity
 * @property {Object} options.variables - Variables passed in on the query string
 * @param {Object} factory - Reference to product factory
 *
 * @returns {Object} - Set product
 */
module.exports = function setProduct(product, apiProduct, options, factory) {
    base.call(this, product, apiProduct, options, factory);

    if (apiProduct) {
        try {
            var allCategories = getAllCategories(apiProduct);
            var primaryCategory = apiProduct.primaryCategory ? apiProduct.primaryCategory.ID : null;
            var subcategory = getSubcategory(allCategories, primaryCategory);

            product.allCategories = allCategories;
            product.creationDate = apiProduct.creationDate;
            product.primaryCategory = primaryCategory;
            product.subcategory = subcategory;
            product.variationModel = apiProduct.variationModel;
        } catch(e) {
            Logger.error('Error in productSet model: {0}', e.toString());
        }
    }

    return product;
};
