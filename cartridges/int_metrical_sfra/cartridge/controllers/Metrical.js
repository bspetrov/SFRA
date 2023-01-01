'use strict';

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var metricalHelpers = require('*/cartridge/scripts/metrical/metricalHelpers').methods;

/**
 * Metrical-AfterFooter: Render helper for velocity template use from AfterFooter hook
 */
server.get('AfterFooter',
    server.middleware.include,
    csrfProtection.generateToken,
    function (req, res, next) {
        var currentSite = dw.system.Site.getCurrent();
        res.render('metrical/metricalScript', {
            userMeta: req.querystring.userMeta,
            isMetricalEnabled: currentSite.getCustomPreferenceValue('Metrical_isEnabled'),
            metricalId: currentSite.getCustomPreferenceValue('Metrical_ID'),
            acLibrarySrc: currentSite.getCustomPreferenceValue('Metrical_acLibrarySrc'),
            isCustomerInteractionsActive: currentSite.getCustomPreferenceValue('Metrical_isCustomerInteractionsActive')
        });

        next();
    }
);

/**
 * Metrical-UpdateUserMeta: Used to update usermeta after a customer interaction event
 */
server.post('UpdateUserMeta',
    function (req, res, next) {
        var action = req.form.action;
        var data = req.form.data ? JSON.parse(req.form.data) : {};
        var userMeta = req.form.userMeta ? JSON.parse(req.form.userMeta) : {};

        try {
            switch (action) {
                case 'updateCart':
                    userMeta = metricalHelpers.getCartData(data, userMeta);
                    break;
                case 'updateProduct':
                    userMeta = metricalHelpers.getProductData(data, userMeta);
                    break;
                case 'updateOrder':
                    userMeta = metricalHelpers.getPageData(data, userMeta);
                    userMeta = metricalHelpers.getOrderData(data, userMeta);
                    break;
            }
        } catch(e) {
            dw.system.Logger.error('Error in Metrical-UpdateUserMeta: {0}', e.toString());
        }

        res.json({ data: userMeta });
        next();
    }
);

module.exports = server.exports();
