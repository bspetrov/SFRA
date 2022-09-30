'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');

/**
 * Goes throug the reviews of the product and returns object with 3 reviews for PDP page
 * @param {string} productID - product ID
 * @returns {Object} reviews for PDP
 */

function getThreeReviews(productID) {
    var productReviewsQuery = CustomObjectMgr.queryCustomObjects('ProductReview', 'custom.reviewProductID = {0}', null, productID);
    var productReviews = productReviewsQuery.hasNext();
    var totalReviews = [];

    if (productReviews) {
        var counter = 0;

        while (productReviewsQuery.hasNext() && counter < 3) {
            var productReview = productReviewsQuery.next();
            var reviewID = productReview.custom.customerIDproductID;
            if (productReview.custom.enabled == true) {
                totalReviews.push(productReview.custom);
            }
        }

    } else {
        totalReviews = false;
    }
    return totalReviews;

};

module.exports = exports = {
    getThreeReviews: getThreeReviews
};