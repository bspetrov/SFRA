'use strict';

var base = module.superModule;

/**
 * @constructor
 * @classdesc CartModel class that represents the current basket
 *
 * @param {dw.order.Basket} basket - Current users's basket
 */
function CartModel(basket) {
    base.call(this, basket);

    if (basket) {
        try {
            this.cartUUID = basket.UUID;
        } catch(e) {
            dw.system.Logger.error('Error in cart model: {0}', e.toString());
        }
    }
}

CartModel.prototype = Object.create(base.prototype);

module.exports = CartModel;