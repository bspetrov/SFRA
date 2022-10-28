'use strict';

var velocity = require('dw/template/Velocity');
var metricalHelpers = require('*/cartridge/scripts/metrical/metricalHelpers');

/**
 * Executes after the footer, renders Metrical code
 */
function afterFooter (pdict) {
    var userMeta = {};
    try {
        userMeta = metricalHelpers.getUserMeta(pdict);
    } catch(e) {
        dw.system.Logger.error('Error in afterFooter function in metricalHooks script: {0}', e.toString());
    }

    velocity.render('$velocity.remoteInclude(\'Metrical-AfterFooter\', \'userMeta\', $userMeta)', {
        velocity: velocity,
        userMeta: JSON.stringify(userMeta)
    });
}

module.exports = {
    afterFooter: afterFooter
}
