'use strict';

var server = require('server');

var page = module.superModule;
server.extend(page);


var OrderMgr = require('dw/order/OrderMgr');
var OrderHistory = require('dw/customer/OrderHistory');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var getOrderedProducts = require('*/cartridge/scripts/helpers/orderedProducts');
var ProductMgr = require('dw/catalog/ProductMgr');



/**
 * Tile-Show : This customization of the Tile-Show controller is created in order to pop up contiu
 * @name Tile-Show
 * 
 */

server.append(
    'Show',
    function(req, res, next) {
        var viewData = res.getViewData();
        var checkProduct = viewData.product;
        var productObject = ProductMgr.getProduct(checkProduct.id);

        if (productObject.variant) {
            var productID = productObject.masterProduct.ID;

        } else {
            var productID = productObject.ID;

        }

        var masterProductQuery = ProductMgr.getProduct(productID);
        var avgProductGrade = masterProductQuery.custom.submittedReviews;

        if (avgProductGrade == "No reviews given") {
            viewData.showStars = false;

        } else {

            viewData.showStars = true;
        }


        viewData.reviewGiven = false;
        viewData.productOrdered = false;
        viewData.avgProductGrade = avgProductGrade;
        

        if (req.currentCustomer.profile) {
            var customer = req.currentCustomer.profile;
            var coKey = customer.customerNo + '-' + productID;
            var testProduct = viewData.product;
            var customerProducts = getOrderedProducts.getOrderedProducts(customer.customerNo);

            if (customerProducts.includes(productID)) {
                viewData.productOrdered = true;
            }

            var checkForReviewQuery = CustomObjectMgr.getCustomObject("ProductReview", coKey);

            if (checkForReviewQuery) {
                viewData.reviewGiven = true;
            }

            viewData.reviewUrl = dw.web.URLUtils.url('Product-GiveReview');
            viewData.loggedIn = true;
        }
        
        res.setViewData(viewData);
        next();

    }
);

module.exports = server.exports();