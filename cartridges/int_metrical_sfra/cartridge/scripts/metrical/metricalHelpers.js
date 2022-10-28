'use strict';

var Logger = require('dw/system/Logger');
var currencyRegex = /[^\d.]/g;

/**
 * Returns customer and geolocation data for the usermeta object
 * @param {Object} res - The route response object
 * @param {Object} userMetaObj - The existing usermeta object
 * @returns {Object} Usermeta object with updated user data
 */
function getUserData(res, userMetaObj) {
    if (res) {
        try {
            var customer = res.CurrentCustomer,
                profile = customer.profile,
                session = res.CurrentSession,
                geolocation = res.CurrentRequest.geolocation,
                isCustomerLoggedIn = customer.registered && profile != null;

            if (isCustomerLoggedIn) {
                userMetaObj.isloggedin = true;
                userMetaObj.customerid = profile.customerNo;
                userMetaObj.zipcode = customer.addressBook.preferredAddress ? customer.addressBook.preferredAddress.postalCode : geolocation.postalCode;
                userMetaObj.accountcreationdate = profile.creationDate;
                userMetaObj.previouspurchasecount = customer.orderHistory.orderCount;

                if (profile.isMale()) {
                    userMetaObj.gender = 'male';
                } else if (profile.isFemale()) {
                    userMetaObj.gender = 'female';
                } else {
                    userMetaObj.gender = null;
                }

                var previousPurchaseValue = 0,
                    orderIterator = customer.orderHistory.orders;
                while (orderIterator.hasNext()) {
                    var order = orderIterator.next();
                    previousPurchaseValue += order.totalGrossPrice.value;
                }
                userMetaObj.previouspurchasevalue = previousPurchaseValue.toFixed(2);

                userMetaObj.isloyaltyprogrammember = module.exports.methods.getLoyaltyProgram(customer).isloyaltyprogrammember;
                userMetaObj.loyaltyprogramnumber = module.exports.methods.getLoyaltyProgram(customer).loyaltyprogramnumber;
            } else {
                userMetaObj.isloggedin = false;
                userMetaObj.zipcode = geolocation.postalCode;

                var values = [
                    'customerid',
                    'gender',
                    'accountcreationdate',
                    'previouspurchasecount',
                    'isloyaltyprogrammember',
                    'loyaltyprogramnumber'
                ];

                values.forEach(function(val) {
                    userMetaObj[val] = null;
                });
            }

            userMetaObj.language = request.httpLocale;
            userMetaObj.currency = session.currency.currencyCode;
            userMetaObj.currencyUS = module.exports.methods.getCurrencyUS(session.currency.currencyCode);
            userMetaObj.latitude = geolocation.latitude;
            userMetaObj.longitude = geolocation.longitude;

            return userMetaObj;
        } catch(e) {
            Logger.error('Error in getUserData function in metricalHelpers script: {0}', e.toString());
        }
    }
    return userMetaObj;
}

/**
 * Returns page and traffic data for the usermeta object
 * @param {Object} res - The route response object
 * @param {Object} userMetaObj - The existing usermeta object
 * @returns {Object} Usermeta object with updated page data
 */
function getPageData(res, userMetaObj) {
    if (res) {
        try {
            var pageType = null;

            switch (res.action) {
                case 'Home-Show':
                case 'Default-Start':
                case 'Sites-' + dw.system.Site.getCurrent().ID + '-Site':
                    pageType = 'index';
                    break;
                case 'Product-Show':
                case 'Product-ShowInCategory':
                    pageType = 'pdp';
                    break;
                case 'Search-Show':
                    if (res.productSearch.isCategorySearch) {
                        pageType = 'category';
                    } else {
                        pageType = 'search';
                    }
                    break;
                case 'Cart-Show':
                    pageType = 'cart';
                    break;
                case 'Checkout-Begin':
                    if (res.currentStage === 'shipping') {
                        pageType = 'shipping';
                    } else if (res.currentStage === 'payment') {
                        pageType = 'payment';
                    } else {
                        pageType = 'checkout';
                    }
                    break;
                case 'Checkout-Login':
                case 'CheckoutShippingServices-SubmitShipping':
                case 'CheckoutServices-SubmitPayment':
                case 'CheckoutServices-PlaceOrder':
                    pageType = 'checkout';
                    break;
                case 'Order-Confirm':
                    pageType = 'confirmation';
                    break;
                case 'Login-Show':
                case 'Account-Show':
                case 'Account-EditProfile':
                case 'Account-EditPassword':
                case 'Address-List':
                case 'Address-AddAddress':
                case 'PaymentInstruments-AddPayment':
                case 'Order-History':
                case 'Order-Details':
                    pageType = 'user';
                    break;
                default:
                    if (res.order) {
                        pageType = 'checkout';
                    } else {
                        pageType = null;
                    }
                    break;
            }

            userMetaObj.pagetype = pageType;
            userMetaObj.trafficsource = request.httpReferer;
            userMetaObj.trafficsourcetype = module.exports.methods.getTrafficSourceType();

            return userMetaObj;
        } catch(e) {
            Logger.error('Error in getPageData function in metricalHelpers script: {0}', e.toString());
        }
    }
    return userMetaObj;
}

/**
 * Returns PDP data for the usermeta object
 * @param {Object} res - The route response object
 * @param {Object} userMetaObj - The existing usermeta object
 * @returns {Object} Usermeta object with updated product data
 */
function getProductData(res, userMetaObj) {
    if (res) {
        try {
            if ('product' in res) {
                var currentSite = dw.system.Site.getCurrent(),
                    product = res.product,
                    imageViewType = currentSite.getCustomPreferenceValue('Metrical_imageViewType') || 'large',
                    itemImages = module.exports.methods.getItemImages(product.images[imageViewType]);

                var msrpprice = product.price.sales ? product.price.sales.decimalPrice : product.price.max.sales.decimalPrice,
                    itemprice = product.price.sales ? product.price.sales.decimalPrice : product.price.min.sales.decimalPrice,
                    itemsaleprice = null;
                if (product.price.list) {
                    msrpprice = product.price.list.decimalPrice;
                    itemprice = product.price.list.decimalPrice;
                    itemsaleprice = product.price.sales.decimalPrice;
                }
                userMetaObj.msrpprice = msrpprice;
                userMetaObj.itemprice = itemprice;
                userMetaObj.itemsaleprice = itemsaleprice;

                userMetaObj.itemname = product.productName;
                userMetaObj.itemgender = module.exports.methods.getItemGender(product.allCategories);
                userMetaObj.itemid = product.masterId || product.id;
                userMetaObj.numskusavailable = product.variationModel.variants && product.variationModel.variants.length ? product.variationModel.variants.length : 1;
                userMetaObj.sku = product.id;
                userMetaObj.itemstocklife = module.exports.methods.getItemStockLife(product.creationDate);
                userMetaObj.itemvendor = product.manufacturerName;
                userMetaObj.itemcategory = product.primaryCategory;
                userMetaObj.itemsubcategory = product.subcategory;
                userMetaObj.isitemdeal = product.promotions ? product.promotions.length > 0 : null;
                userMetaObj.itemdealpercent = module.exports.methods.getItemDeal(product).percent;
                userMetaObj.itemdealamount = module.exports.methods.getItemDeal(product).amount;
                userMetaObj.couponavailable = module.exports.methods.isCouponAvailable(product);
                userMetaObj.numimages = product.images[imageViewType] ? product.images[imageViewType].length : null;
                userMetaObj.itemimages = itemImages;
                userMetaObj.itemfeaturedimage = product.images[imageViewType] ? product.images[imageViewType][0].absURL : null;
                userMetaObj.isfeatured = module.exports.methods.isFeatured(product);
                userMetaObj.isbookmarked = module.exports.methods.isBookmarked(product);
                userMetaObj.customerrating = module.exports.methods.getCustomerRating(product);
                userMetaObj.numreviews = module.exports.methods.getNumReviews(product);
            } else {
                var values = [
                    'itemname',
                    'itemgender',
                    'msrpprice',
                    'itemprice',
                    'itemsaleprice',
                    'itemid',
                    'numskusavailable',
                    'sku',
                    'itemstocklife',
                    'itemvendor',
                    'itemcategory',
                    'itemsubcategory',
                    'isitemdeal',
                    'itemdealpercent',
                    'itemdealamount',
                    'couponavailable',
                    'coupontext',
                    'numimages',
                    'itemimages',
                    'itemfeaturedimage',
                    'isfeatured',
                    'isbookmarked',
                    'customerrating',
                    'numreviews'
                ];
                values.forEach(function(val) {
                    userMetaObj[val] = null;
                });
            }

            return userMetaObj;
        } catch(e) {
            Logger.error('Error in getProductData function in metricalHelpers script: {0}', e.toString());
        }
    }
    return userMetaObj;
}

/**
 * Returns cart data for the usermeta object
 * @param {Object} res - The route response object
 * @param {Object} userMetaObj - The existing usermeta object
 * @returns {Object} Usermeta object with updated cart data
 */
function getCartData(res, userMetaObj) {
    if (res) {
        try {
            var BasketMgr = require('dw/order/BasketMgr');

            var idArray = [],
                quantityArray = [],
                priceArray = [],
                skuArray = [];

            if ('items' in res || ('order' in res && res.action !== 'Order-Details') || 'cart' in res) {
                var items,
                    totalNumItems = 0,
                    cartTotal = 0;

                if (res.cartUUID) {
                    session.custom.cartid = res.cartUUID;
                }

                if (res.action === 'Cart-UpdateQuantity') {
                    items = res.items;
                } else if (res.items) {
                    items = res.items.toArray();
                } else if (res.order) {
                    items = res.order.items.items;
                } else if (res.cart) {
                    items = res.cart.items;
                }

                items.forEach(function(item) {
                    var itemPrice = item.price ? item.price.sales.decimalPrice : parseFloat(item.priceTotal.price.replace(currencyRegex, '')).toFixed(2);
                    totalNumItems += item.quantity;
                    idArray.push(item.masterId || item.id);
                    skuArray.push(item.id);
                    quantityArray.push(item.quantity);
                    priceArray.push(itemPrice);
                    cartTotal += (itemPrice * item.quantity);
                });

                var uniqueItems = idArray.filter(function(value, index, self){
                    return self.indexOf(value) === index;
                });

                userMetaObj.cartid = res.cartUUID || session.custom.cartid;
                userMetaObj.numuniqueitemsincart = uniqueItems.length;
                userMetaObj.numuniqueskusincart = items.length;
                userMetaObj.totalnumitemsincart = totalNumItems;
                userMetaObj.cartidlist = idArray.length ? '[' + idArray.join('+') + ']' : null;
                userMetaObj.cartskulist = skuArray.length ? '[' + skuArray.join('+') + ']' : null;
                userMetaObj.cartqtylist = quantityArray.length ? '[' + quantityArray.join('+') + ']' : null;
                userMetaObj.cartpricelist = priceArray.length ? '[' + priceArray.join('+') + ']' : null;
                userMetaObj.subtotalcartvalue = cartTotal.toFixed(2) || null;
            } else {
                var currentBasket = BasketMgr.getCurrentBasket();

                if (currentBasket) {
                    var items = currentBasket.productLineItems,
                        itemsIterator = items.iterator();

                    while (itemsIterator.hasNext()) {
                        var item = itemsIterator.next();
                        var itemID = item.product.variationModel.master ? item.product.variationModel.master.ID : item.product.ID;
                        idArray.push(itemID);
                        skuArray.push(item.productID);
                        quantityArray.push(item.quantityValue);
                        priceArray.push(item.price.decimalValue);
                    }

                    var uniqueItems = idArray.filter(function(value, index, self){
                        return self.indexOf(value) === index;
                    });

                    userMetaObj.cartid = currentBasket.UUID || session.custom.cartid;
                    userMetaObj.numuniqueitemsincart = uniqueItems.length;
                    userMetaObj.totalnumitemsincart = currentBasket.productQuantityTotal;
                    userMetaObj.numuniqueskusincart = items.length;
                    userMetaObj.cartidlist = idArray.length ? '[' + idArray.join('+') + ']' : null;
                    userMetaObj.cartskulist = skuArray.length ? '[' + skuArray.join('+') + ']' : null;
                    userMetaObj.cartqtylist = quantityArray.length ? '[' + quantityArray.join('+') + ']' : null;
                    userMetaObj.cartpricelist = priceArray.length ? '[' + priceArray.join('+') + ']' : null;
                    userMetaObj.subtotalcartvalue = currentBasket.merchandizeTotalNetPrice.value.toFixed(2);
                } else {
                    var values = [
                        'cartid',
                        'numuniqueitemsincart',
                        'numuniqueskusincart',
                        'totalnumitemsincart',
                        'cartidlist',
                        'cartskulist',
                        'cartqtylist',
                        'cartpricelist',
                        'subtotalcartvalue'
                    ];
                    values.forEach(function(val) {
                        userMetaObj[val] = null;
                    });
                }
            }

            return userMetaObj;
        } catch(e) {
            Logger.error('Error in getCartData function in metricalHelpers script: {0}', e.toString());
        }
    }
    return userMetaObj;
}

/**
 * Returns order data for the usermeta object in checkout
 * @param {Object} res - The route response object
 * @param {Object} userMetaObj - The existing usermeta object
 * @returns {Object} Usermeta object with updated order data
 */
function getOrderData(res, userMetaObj) {
    if (res) {
        try {
            if ('order' in res) {
                var order = res.order,
                    billingAddress = order.billing.billingAddress.address,
                    shipping = order.shipping[0],
                    shippingAddress = shipping.shippingAddress,
                    orderTotals = order.totals;

                var discountedShipping = null;
                if (orderTotals.shippingLevelDiscountTotal) {
                    discountedShipping = orderTotals.shippingLevelDiscountTotal.value > 0 ? orderTotals.shippingLevelDiscountTotal.value.toFixed(2) : null;
                }

                var discountValue = null;
                if (orderTotals.orderLevelDiscountTotal) {
                    discountValue = orderTotals.orderLevelDiscountTotal.value > 0 ? orderTotals.orderLevelDiscountTotal.value.toFixed(2) : null;
                }

                userMetaObj.tax = orderTotals.totalTax ? orderTotals.totalTax.replace(currencyRegex, '') : null;
                userMetaObj.discountedshipping = discountedShipping;
                userMetaObj.shippingcost = orderTotals.totalShippingCost ? orderTotals.totalShippingCost.replace(currencyRegex, '') : null;
                userMetaObj.discountsapplied = orderTotals.discounts.length > 0;
                userMetaObj.discountvalue = discountValue;
                userMetaObj.paymentmethod = order.billing.payment.applicablePaymentMethods[0].name;
                userMetaObj.shippingtmethod = shipping.selectedShippingMethod ? shipping.selectedShippingMethod.displayName : null;
                userMetaObj.shippingmethodcost = shipping.selectedShippingMethod.shippingCost ? shipping.selectedShippingMethod.shippingCost.replace(currencyRegex, '') : null;
                userMetaObj.billaddress = billingAddress ? billingAddress.address1 : null;
                userMetaObj.billcity = billingAddress ? billingAddress.city : null;
                userMetaObj.billstate = billingAddress ? billingAddress.stateCode : null;
                userMetaObj.billzip = billingAddress ? billingAddress.postalCode : null;
                userMetaObj.billcountry = billingAddress ? billingAddress.countryCode.value : null;
                userMetaObj.shipdifferentthanbill = billingAddress && shippingAddress ? billingAddress.address1 !== shippingAddress.address1 : null;
                userMetaObj.shipaddress = shippingAddress ? shippingAddress.address1 : null;
                userMetaObj.shipcity = shippingAddress ? shippingAddress.city : null;
                userMetaObj.shipstate = shippingAddress ? shippingAddress.stateCode : null;
                userMetaObj.shipzip = shippingAddress ? shippingAddress.postalCode : null;
                userMetaObj.shipcountry = shippingAddress ? shippingAddress.countryCode.value : null;
                userMetaObj.isgift = shipping.isGift ? true : null;
                userMetaObj.isresidentialdelivery = module.exports.methods.isResidentialDelivery(shipping);
                userMetaObj.isbusinessdelivery = module.exports.methods.isBusinessDelivery(shipping);
                userMetaObj.deliverydate = module.exports.methods.getDeliveryDate(order);
            } else {
                var values = [
                    'tax',
                    'discountedshipping',
                    'shippingcost',
                    'discountsapplied',
                    'discountvalue',
                    'paymentmethod',
                    'shippingtmethod',
                    'shippingmethodcost',
                    'billaddress',
                    'billcity',
                    'billstate',
                    'billzip',
                    'billcountry',
                    'shipdifferentthanbill',
                    'shipaddress',
                    'shipcity',
                    'shipstate',
                    'shipzip',
                    'shipcountry',
                    'isgift',
                    'isresidentialdelivery',
                    'isbusinessdelivery',
                    'deliverydate'
                ];
                values.forEach(function(val) {
                    userMetaObj[val] = null;
                });
            }

            return userMetaObj;
        } catch(e) {
            Logger.error('Error in getOrderData function in metricalHelpers script: {0}', e.toString());
        }
    }
    return userMetaObj;
}

/**
 * Returns order data for the usermeta object after order has been placed
 * @param {Object} res - The route response object
 * @param {Object} userMetaObj - The existing usermeta object
 * @returns {Object} Usermeta object with updated order data
 */
function getOrderConfirmationData(res, userMetaObj) {
    if (res) {
        try {
            if ('order' in res && res.order.orderNumber) {
                var order = res.order;

                var couponcode = [],
                    coupontext = [];
                if (order.totals.discounts.length) {
                    for (var discount of order.totals.discounts) {
                        couponcode.push(discount.couponCode);
                        coupontext.push(discount.relationship.length ? discount.relationship[0].callOutMsg.source : '');
                    }
                }

                userMetaObj.orderid = order.orderNumber;
                userMetaObj.ispurchase = true;
                userMetaObj.totalcartvalue = order.totals.grandTotal.replace(currencyRegex, '');
                userMetaObj.couponcode = couponcode.length ? '[' + couponcode.join('+') + ']' : null;
                userMetaObj.coupontext = coupontext.length ? '[' + coupontext.join('+') + ']' : null;
            } else {
                userMetaObj.ispurchase = null;
                userMetaObj.orderid = null;

                var values = [
                    'totalcartvalue',
                    'couponcode',
                    'coupontext'
                ];
                values.forEach(function(val) {
                    userMetaObj[val] = null;
                });
            }

            return userMetaObj;
        } catch(e) {
            Logger.error('Error in getOrderConfirmationData function in metricalHelpers script: {0}', e.toString());
        }
    }
    return userMetaObj;
}

/**
 * Extensible methods for customization
 */
function getLoyaltyProgram(customer) {
    return {
        isloyaltyprogrammember: null,
        loyaltyprogramnumber: null
    }
}

function getCurrencyUS() {
    return null;
}

function getTrafficSourceType() {
    return null;
}

function getItemGender(categories) {
    if (categories && categories.length) {
        for (var category of categories) {
            if (category.indexOf('women') > -1) {
                return 'female';
            } else if (category.indexOf('men') > -1) {
                return 'male';
            }
        }
    }
    return null;
}

function getItemStockLife(creationDate) {
    if (creationDate) {
        var newDate = new Date();
        return Math.floor((newDate - creationDate)/86400000);
    }
    return null;
}

function getItemImages(images) {
    if (images) {
        var imageArr = [];
        images.forEach(function (image) {
            imageArr.push(image.absURL);
        });
        return imageArr.length ? '[' + imageArr.join('+') + ']' : null;
    }
    return null;
}

function getItemDeal(product) {
    return {
        percent: null,
        amount: null
    }
}

function isCouponAvailable(product) {
    return null;
}

function isFeatured(product) {
    return null;
}

function isBookmarked(product) {
    return null;
}

function getCustomerRating(product) {
    return null;
}

function getNumReviews(product) {
    return null;
}

function isResidentialDelivery(shipping) {
    return null;
}

function isBusinessDelivery(shipping) {
    return null;
}

function getDeliveryDate(order) {
    return null;
}

/**
 * Creates usermeta object
 * @param {Object} res - The route response object
 * @returns {Object} Object containing usermeta data
 */
function getUserMeta(res) {
    var userMetaObj = {};

    try {
        module.exports.methods.getUserData(res, userMetaObj);
        module.exports.methods.getPageData(res, userMetaObj);
        module.exports.methods.getProductData(res, userMetaObj);
        module.exports.methods.getCartData(res, userMetaObj);
        module.exports.methods.getOrderData(res, userMetaObj);
        module.exports.methods.getOrderConfirmationData(res, userMetaObj);
    } catch(e) {
        Logger.error('Error in getUserMeta function in metricalHelpers script: {0}', e.toString());
    }

    return userMetaObj;
}

module.exports = {
    methods: {
        getUserData: getUserData,
        getPageData: getPageData,
        getProductData: getProductData,
        getCartData: getCartData,
        getOrderData: getOrderData,
        getOrderConfirmationData: getOrderConfirmationData,
        getCurrencyUS: getCurrencyUS,
        getLoyaltyProgram: getLoyaltyProgram,
        getTrafficSourceType: getTrafficSourceType,
        getItemImages: getItemImages,
        getItemGender: getItemGender,
        getItemStockLife: getItemStockLife,
        getItemDeal: getItemDeal,
        isCouponAvailable: isCouponAvailable,
        isFeatured: isFeatured,
        isBookmarked: isBookmarked,
        getCustomerRating: getCustomerRating,
        getNumReviews: getNumReviews,
        isResidentialDelivery: isResidentialDelivery,
        isBusinessDelivery: isBusinessDelivery,
        getDeliveryDate: getDeliveryDate
    },
    getUserMeta: getUserMeta
};
