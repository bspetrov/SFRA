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
        var newxmlFile = new File(File.IMPEX + '/src/Pricebooks/' + '-doubled' + pricebookXML);

        var xmlFileReader = new FileReader(xmlFile);
        var xmlFileWriter = new FileWriter(newxmlFile, "UTF-8");

        var xmlReader = new XMLStreamReader(xmlFileReader);
        var xmlWriter = new XMLStreamWriter(xmlFileWriter);


        while (xmlReader.hasNext()) {
            if (xmlReader.next() === XMLStreamConstants.START_ELEMENT) {
                var wholeObject = xmlReader.readXMLObject();
                var test = 1;
            };
        };

        for (var i = 0; i <= 1; i++) {
            wholeObject["price-tables"]["price-table"][i]["amount"] *= 2;
            wholeObject["price-tables"]["price-table"][i]["amount"]["@quantity"] = 1;
            
        };

        xmlWriter.writeRaw(wholeObject);
        xmlWriter.close();
        xmlFileWriter.close();

    } catch (e) {
        Logger.error('importDoublePrices.js has failed reading the pricebook XML with the following error: ' + e.message);
    };
};

module.exports = {
    doublePrices: doublePrices
};