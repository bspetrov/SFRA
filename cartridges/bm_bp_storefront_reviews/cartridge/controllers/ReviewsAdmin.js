'use strict';

var server = require('server');

var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');  


/**
 * Render the reviews submitted for all products
 * @name ReviewsAdmin-Reviews
 * @function
 */


server.get(
    "Reviews",
    function (req, res, next) {
        var allReviewsQuery = CustomObjectMgr.getAllCustomObjects('ProductReview');
        var allReviews = [];
        var editURL = URLUtils.url('ReviewsAdmin-StatusHandler');
    
        while (allReviewsQuery.hasNext()) {
            var currentReview = allReviewsQuery.next();
            allReviews.push(currentReview);
        }

        res.render('reviewsTemplate', {
            allReviews: allReviews,
            editURL: editURL

        });
        next();
    }
);


/**
 * Process review enable/disable.
 * @name ReviewsAdmin-StatusHandler
 * @function
 */


server.get(
    "StatusHandler",
    function(req, res, next) {
        var reviewID = req.querystring.id;
        var reviewAction = req.querystring.action;
        var getReviewCO = CustomObjectMgr.getCustomObject("ProductReview", reviewID);
        var actionHolder = null;

        if (reviewAction == "disable") {
            actionHolder = false;

        } else {
            actionHolder = true;

        }
        Transaction.wrap(function() {
            getReviewCO.custom.enabled = actionHolder;
        });
        res.redirect("ReviewsAdmin-Reviews");
        next();
    }

);


module.exports = server.exports();