'use strict';

var CustomObjectMgr = require('dw/object/CustomObjectMgr');

/**
 * Goes through all Review CO's for the provided product and returns the avg grade.
 * @param {string} productID - product ID
 * @returns {integer} average product grade
 */

function getAvgGrade(productID) {
    var productReviewsQuery = CustomObjectMgr.queryCustomObjects('ProductReview', 'custom.reviewProductID = {0}', null, productID);
    var productReviews = productReviewsQuery.hasNext();
    var gradesHolder = [];
    var avgGrade = 0;

    if (productReviews) {

        while (productReviewsQuery.hasNext()) {
            var productReview = productReviewsQuery.next();
            var productReviewGrade = productReview.custom.reviewGrade;
            gradesHolder.push(productReviewGrade);
        }

        for (var i = 0; i < gradesHolder.length; i++) {
            avgGrade += gradesHolder[i];
        }
        return Math.ceil(avgGrade / gradesHolder.length);

    } else {

        avgGrade = "No reviews given";
        return avgGrade;
    }

};

module.exports = exports = {
    getAvgGrade: getAvgGrade
};