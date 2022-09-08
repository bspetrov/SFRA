'use strict';

var ProductMgr = require('dw/catalog/ProductMgr');
var calc = require('bp_storefront_reviews/cartridge/scripts/helpers/calculateAvgProductGrade');
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');


function calculateAvgProductGrade(){
    var currentSite = Site.current;
    var siteProducts = ProductMgr.queryAllSiteProductsSorted();

    while (siteProducts.hasNext()) {
        var product = siteProducts.next();
        var productID = null;

        if (product.variant == true) {
            productID = product.masterProduct.ID;

        } else {
            productID = product.ID;
        }
        var average = calc.getAvgGrade(productID);
        Transaction.begin();
        product.custom.submittedReviews = String(average);
        Transaction.commit();
    }
};

module.exports = {
    calculateAvgProductGrade: calculateAvgProductGrade
};