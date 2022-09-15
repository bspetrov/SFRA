'use strict';

var server = require('server');
var page = module.superModule;
server.extend(page);

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var URLUtils = require('dw/web/URLUtils');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var getOrderedProducts = require('*/cartridge/scripts/helpers/orderedProducts')
var ProductMgr = require('dw/catalog/ProductMgr');
var pdpReviews = require('*/cartridge/scripts/helpers/pdpReviews');


/**
 * Product-GiveReview : This endpoint is when the shopper selects "Give review" on a product he has ordered already.
 * @name Product-GiveReview
 * @function
 */

server.get(
    "GiveReview",
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var requestID = req.querystring.id;
        var productPDPUrl = URLUtils.url("Product-Show", 'pid', requestID);

        if (req.currentCustomer.profile) {
            try {
                var customerNo = req.currentCustomer.profile.customerNo;
                var coKey = customerNo + "-" + requestID;
                var checkForReviewQuery = CustomObjectMgr.getCustomObject("ProductReview", coKey)
                var continueUrl = URLUtils.url('Home-Show');

                if (!checkForReviewQuery) {
                    var customerProducts = getOrderedProducts.getOrderedProducts(customerNo);
                    
                    if (customerProducts.includes(requestID)) {
                        var actionUrl = dw.web.URLUtils.url('Product-GiveReviewHandler');
                        var reviewForm = server.forms.getForm('review');
                        reviewForm.clear();

                        res.render('review/writeReview', {
                            actionUrl: actionUrl,
                            reviewForm: reviewForm,
                            productID: requestID
                        });
                    } else {
                        res.render('account/missingProduct', {
                            productPDPUrl: productPDPUrl
                        });
                    }
                } else {
                    res.render('account/reviewExisting', {
                        continueUrl: continueUrl
                    });   
                }

            } catch (e) {
                res.json({
                    "ERROR": e
                })
            }

        } else {
            res.redirect("Login-Show");
        }
        next();

    }
);

/**
 * Product-GiveReviewHandler : This endpoint processes the form and submits the data to a Reviews CO instance.
 * @name Product-GiveReviewHandler
 * @function
 */

server.post(
    "GiveReviewHandler",
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var reviewForm = server.forms.getForm('review');
        var continueUrl = URLUtils.url('Home-Show');
        var productID = req.querystring.id
        var reviewCustomer = req.currentCustomer.profile;
        var coKey = reviewCustomer.customerNo + "-" + productID;
        var currentProduct = ProductMgr.getProduct(productID);
        var testArray = [];

        if (reviewForm.valid) {
            var reviewDescription = reviewForm.description.value;
            var reviewGrade = reviewForm.grade.value;
            var reviewTitle = reviewForm.title.value;

            try {
                Transaction.wrap(function () {
                    var reviewCustomObject = CustomObjectMgr.createCustomObject('ProductReview', coKey);
                    reviewCustomObject.custom.reviewCustomer = reviewCustomer.customerNo;
                    reviewCustomObject.custom.reviewProductID = productID;
                    reviewCustomObject.custom.reviewDescription = reviewDescription;
                    reviewCustomObject.custom.reviewGrade = reviewGrade;
                    reviewCustomObject.custom.reviewTitle = reviewTitle;
                    reviewCustomObject.custom.enabled = true;
                    res.render('account/reviewSubmitted', {
                        continueUrl: continueUrl
                    });

                });
            } catch (e) {
                var err = e;
                if (err.causeName == 'ORMSQLException') {
                    res.render('account/reviewExisting', {
                        continueUrl: continueUrl
                    });
                } else {
                    res.setStatusCode(500);
                    res.json({
                        error: true,
                        redirectUrl: URLUtils.url("Error-Start").toString(),
                        message: e
                    });
                }
            }
        } else {
            res.json({
                "error": "Make sure the grade is a number from 1 to 5!"
            });
        }
        next();
    }
);

/**
 * This endpoint extends the base PDP endpoint in order to add reviews
 * @name Product-Show
 * @function
 */

server.append(
    "Show",
    server.middleware.https,
    function(req, res, next) {
        var viewData = res.getViewData();
        viewData.loggedIn = false;
        viewData.reviewGiven = false;
        viewData.productOrdered = false;
        viewData.reviewUrl = URLUtils.url("Product-GiveReview");
        if (req.currentCustomer.profile) {
            viewData.loggedIn = true;
            var customerNo = req.currentCustomer.profile.customerNo;
            var [currentShoes, currentClothes] = [customer.profile.custom.defaultSizeShoes, customer.profile.custom.defaultSizeClothes];
        }
        if (currentShoes && currentClothes) {
            viewData.userDefaults = true;
            viewData.defaultShoes = currentShoes;
            viewData.defaultClothes = currentClothes;

        }
        var requestID = req.querystring.pid;
        var coKey = customerNo + "-" + requestID;
        var checkForReviewQuery = CustomObjectMgr.getCustomObject("ProductReview", coKey)

        if (checkForReviewQuery) {
            viewData.reviewGiven = true;
        }

        var customerProducts = getOrderedProducts.getOrderedProducts(customerNo);
        if (customerProducts.includes(req.querystring.pid)) {
            viewData.productOrdered = true;
        }

        var fullProduct = ProductMgr.getProduct(viewData.product.id);
        var avgProductGrade = fullProduct.custom.submittedReviews;
        var allReviews = pdpReviews.getThreeReviews(viewData.product.id);
        viewData.avgProductGrade = avgProductGrade;
        viewData.allReviews = allReviews;
        viewData.requestID = requestID;


        res.setViewData(viewData);



        next();
    }
)

module.exports = server.exports();