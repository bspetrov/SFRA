'use strict';

var base = module.superModule;
var Logger = require('dw/system/Logger');

function getMasterId(product) {
    if (product) {
        try {
            if (!product.master && product.variationModel.master) {
                return product.variationModel.master.ID;
            } else {
                return product.ID;
            }
        } catch(e) {
            Logger.error('Error in getMasterId function in orderLineItem model: {0}', e.toString());
        }
    }
    return null;
}

/**
 * Decorate product with product line item information from within an order
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {Object} options - Options passed in from the factory
 * @property {dw.catalog.ProductVarationModel} options.variationModel - Variation model returned by the API
 * @property {Object} options.lineItemOptions - Options provided on the query string
 * @property {dw.catalog.ProductOptionModel} options.currentOptionModel - Options model returned by the API
 * @property {dw.util.Collection} options.promotions - Active promotions for a given product
 * @property {number} options.quantity - Current selected quantity
 * @property {Object} options.variables - Variables passed in on the query string
 *
 * @returns {Object} - Decorated product model
 */
function orderLineItem(product, apiProduct, options) {
    base.call(this, product, apiProduct, options);

    product.masterId = getMasterId(apiProduct);

    return product;
}

module.exports = orderLineItem;
