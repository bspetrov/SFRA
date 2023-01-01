/**
 * Makes a call to Metrical-UpdateUserMeta to update usermeta
 * @param {String} action updateCart, updateProduct, or updateOrder
 * @param {Object} data Data from interaction event
 * @param {Object} userMeta Existing usermeta object
 * @returns {Object} Updated usermeta object
 */
async function updateUserMeta(action, data, userMeta) {
    var updateUrl = $('.metrical').data('update-url');
    try {
        var userMetaObj = await $.ajax({
            url: updateUrl,
            type: 'POST',
            data: {
                action: action,
                data: JSON.stringify(data),
                userMeta: JSON.stringify(userMeta)
            },
            success: function (response) {
                return response.data;
            },
            error: function (error) {
                throw new Error('Metrical update usermeta error');
            }
        });
    } catch (e) {
        throw new Error('Metrical update usermeta error');
    }

    return userMetaObj;
}

/**
 * Customer interaction events
 */
$('document').ready(function() {
    $('body').on('product:afterAddToCart', function (e, response) {
        new Promise(function(resolve, reject) {
            resolve(updateUserMeta('updateCart', response, _MetricalAbandonCart.passedInProperties.usermeta));
        }).then(function(result) {
            _MetricalAbandonCart.passedInProperties.usermeta = result.data;
            _MetricalCommerceCloud.userMeta = result.data;
            _MetricalAbandonCart.recordInteraction("product:afterAddToCart");
        }).catch(function(error) {
            throw new Error('Metrical record interaction error');
        });
    });

    $('body').on('product:afterAttributeSelect', function (e, response) {
        new Promise(function(resolve, reject) {
            resolve(updateUserMeta('updateProduct', response.data, _MetricalAbandonCart.passedInProperties.usermeta));
        }).then(function(result) {
            _MetricalAbandonCart.passedInProperties.usermeta = result.data;
            _MetricalCommerceCloud.userMeta = result.data;
            _MetricalAbandonCart.recordInteraction("product:afterAttributeSelect");
        }).catch(function(error) {
            throw new Error('Metrical record interaction error');
        });
    });

    $('body').on('cart:update', function (e, response) {
        new Promise(function(resolve, reject) {
            resolve(updateUserMeta('updateCart', response, _MetricalAbandonCart.passedInProperties.usermeta));
        }).then(function(result) {
            _MetricalAbandonCart.passedInProperties.usermeta = result.data;
            _MetricalCommerceCloud.userMeta = result.data;
            _MetricalAbandonCart.recordInteraction("cart:update");
        }).catch(function(error) {
            throw new Error('Metrical record interaction error');
        });
    });

    $('body').on('checkout:updateCheckoutView', function (e, response) {
        new Promise(function(resolve, reject) {
            resolve(updateUserMeta('updateOrder', response, _MetricalAbandonCart.passedInProperties.usermeta));
        }).then(function(result) {
            _MetricalAbandonCart.passedInProperties.usermeta = result.data;
            _MetricalCommerceCloud.userMeta = result.data;
            _MetricalAbandonCart.recordInteraction("checkout:updateCheckoutView");
        }).catch(function(error) {
            throw new Error('Metrical record interaction error');
        });
    });
});
