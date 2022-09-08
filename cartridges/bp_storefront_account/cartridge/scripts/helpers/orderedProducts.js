'use strict';

var OrderMgr = require('dw/order/OrderMgr');

/**
 * Goes through order history of the customer and returns an array of ordered products.
 * @param {string} customerNo - customer number
 * @returns {Array} array containing customer products
 */

function getOrderedProducts(customerNo) {
    var customerOrdersQuery = OrderMgr.queryOrders('customerNo = {0}', null, customerNo);
    var totalOrders = customerOrdersQuery.hasNext();
    var customerProducts = [];
    if (totalOrders) {
        while (customerOrdersQuery.hasNext()) {
            var order = customerOrdersQuery.next();
            var orderItems = order.productLineItems;
            for (var item in orderItems) {
                var product = orderItems[item].product;
                var productID = null;
                if (product.variant == true) {
                    productID = product.masterProduct.ID;
                    customerProducts.push(productID);
                } else {
                    productID = product.ID;
                    customerProducts.push(productID);
                }
            }
        }
        return customerProducts;
    }
    return customerProducts;
};

module.exports = exports = {
    getOrderedProducts: getOrderedProducts
};