'use strict';

var server = require('server');

var page = module.superModule;

server.extend(page);

/**
 * Extending Account-Show route to display new default attributes.
 */

server.append(
    'Show',
    function (req, res, next) {
        var viewData = res.getViewData();
        var actionUrl = dw.web.URLUtils.url('Account-SaveDefaults');
        var defaultsForm = server.forms.getForm('sizedefaults');
        defaultsForm.clear();

        let [currentShoes, currentClothes] = [customer.profile.custom.defaultSizeShoes, customer.profile.custom.defaultSizeClothes]
        if (!currentShoes && !currentClothes){
            [currentShoes, currentClothes] = ['There is no default!', 'There is no default!'];
        }

        viewData.actionUrl = actionUrl
        viewData.defaultsForm = defaultsForm
        viewData.currentShoes = currentShoes
        viewData.currentClothes = currentClothes

        res.setViewData(viewData);
        next();
    }

);

server.post(
    'SaveDefaults',
    function(req, res, next) {
        var defaultsForm = server.forms.getForm('sizedefaults');
        var continueUrl = dw.web.URLUtils.url('Account-Show');

        var clothesSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        var shoesSizes = [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
        var newClothesSize = defaultsForm.clothes.value;
        var newShoesSize = defaultsForm.shoes.value;
        

        if (defaultsForm.valid && clothesSizes.includes(newClothesSize) && shoesSizes.includes(newShoesSize)) {
            try {
                var CustomerMgr = require('dw/customer/CustomerMgr');
                var Transaction = require('dw/system/Transaction');
                Transaction.begin();
                var customerProfile = CustomerMgr.getProfile(customer.profile.customerNo);
                customerProfile.custom.defaultSizeClothes = newClothesSize;
                customerProfile.custom.defaultSizeShoes = newShoesSize;
                Transaction.commit();
                res.redirect('Account-Show');

            } catch (e) {
                var err = e;
                res.statusCode(500);
                res.json({
                    error: err
                });
            };
        } else {
            res.render('account/defaultSizeError');
        };
        next();
    }
);

module.exports = server.exports();