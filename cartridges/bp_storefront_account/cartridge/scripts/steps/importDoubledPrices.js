'use strict';

const File = require('dw/io/File');
const FileReader = require('dw/io/FileReader');
const XMLStreamReader = require('dw/io/XMLStreamReader');
const Logger = require('dw/system/Logger');
const XMLStreamConstants = require('dw/io/XMLStreamConstants');
const XMLStreamWriter = require('dw/io/XMLStreamWriter');
const FileWriter = require('dw/io/FileWriter');

/**
 * Get the pricebook XML from Impex, double prices on products in the pricebook
 * @param {string} pricebookXML - Pricebook file
 */

function doublePrices(parameters) {
    try {
        var pricebookXML = parameters.pricebookXML;
        var xmlFile = new File(File.IMPEX + '/src/Pricebooks/' + pricebookXML);
        var xmlFileReader = new FileReader(xmlFile);

        var xmlReader = new XMLStreamReader(xmlFileReader);

        while (xmlReader.hasNext()) {
            if (xmlReader.next() === XMLStreamConstants.START_ELEMENT) {
                var localElementName = xmlReader.getLocalName();

                if (localElementName === 'priceTable') {
                    var myObject = xmlReader.readXMLObject();
                    myObject.amount *= 2;
                    return myObject;
                }
            }
        }

    } catch (e) {
        Logger.error('importDoublePrices.js has failed reading the pricebook XML with the following error: ' + e.message);
    };
};

module.exports = {
    doublePrices: doublePrices
};




