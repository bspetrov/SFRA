/**
 * Function for Metrical to use to apply coupon code. Makes a call to Cart-AddCoupon.
 * @param {String} code The coupon code
 */
var applyDiscount = function (code) {
    var discountUrl = $('.metrical').data('coupon-url');
    var $csrfToken = $('input.metrical-discount-token')[0].value;
    var $formData = `couponCode=${code}&csrf_token=${$csrfToken}`;

    $.ajax({
        url: discountUrl,
        type: 'GET',
        data: $formData,
        success: function(response) {
            console.log('Coupon successfully applied');
        },
        error: function(error) {
            throw new Error('Coupon could not be applied');
        }
    });
}