'use strict';

var Status = require('dw/system/Status');
var Calendar = require('dw/util/Calendar');
var StringUtils = require('dw/util/StringUtils');

exports.beforePATCH = function checkDefaultSizes(customer, customerInput) {
    if (customerInput.c_defaultSizeClothes == null && customerInput.c_defaultSizeShoes == null) {
        response.setStatus(400);
        return new Status(Status.ERROR, 'Default sizes required!');

    }
    return new Status(Status.OK);
};