'use strict';

const File = require('dw/io/File');
const FileReader = require('dw/io/FileReader');
const XMLStreamReader = require('dw/io/XMLStreamReader');
const Logger = require('dw/system/Logger');
const XMLStreamConstants = require('dw/io/XMLStreamConstants');
const XMLStreamWriter = require('dw/io/XMLStreamWriter');
const FileWriter = require('dw/io/FileWriter');
const XMLIndentingStreamWriter = require('dw/io/XMLIndentingStreamWriter');
const PriceBookMgr = require('dw/catalog/PriceBookMgr');

/**
 * Get the pricebook XML from Impex, double prices on products in the pricebook
 * @param {string} pricebookXML - Pricebook file
 */

function doublePrices(parameters) {
    try {
        var pricebookXML = parameters.pricebookXML;
        var pricebookID = parameters.pricebookID;
        var xmlFile = new File(File.IMPEX + '/src/Pricebooks/' + pricebookXML);
        var newxmlFile = new File(File.IMPEX + '/src/Pricebooks/' + '-doubled' + pricebookXML);
        var pricebookData = PriceBookMgr.getPriceBook(pricebookID);


        var xmlFileReader = new FileReader(xmlFile);
        var xmlFileWriter = new FileWriter(newxmlFile, "UTF-8");

        var xmlReader = new XMLStreamReader(xmlFileReader);
        var xmlWriter = new XMLIndentingStreamWriter(xmlFileWriter);


        while (xmlReader.hasNext()) {
            if (xmlReader.next() === XMLStreamConstants.START_ELEMENT) {
                var localName = xmlReader.getLocalName();

                if (localName === 'price-tables') {
                    var removeNs = xmlReader.getXMLObject().toString().replace(/ xmlns=".*"/mgi, "");
                    var priceTables = XML(removeNs);
                }
            }
        };

        var productAmount = priceTables.children().length();
        xmlWriter.writeStartDocument("UTF-8", "1.0");

        xmlWriter.writeStartElement("pricebooks");
        xmlWriter.writeNamespace("xmlns", "http://www.demandware.com/xml/impex/pricebook/2006-10-31");
          xmlWriter.writeStartElement("pricebook");
            xmlWriter.writeStartElement("header");
              xmlWriter.writeAttribute("pricebook-id", pricebookID);
              xmlWriter.writeStartElement("currency");
                xmlWriter.writeCharacters(pricebookData.currencyCode);
              xmlWriter.writeEndElement();
              xmlWriter.writeStartElement("display-name");
                xmlWriter.writeAttribute("xml:lang", "x-default");
                xmlWriter.writeCharacters(pricebookData.displayName);
              xmlWriter.writeEndElement();
              xmlWriter.writeStartElement("description");
                xmlWriter.writeAttribute("xml:lang", "x-default");
                xmlWriter.writeCharacters(pricebookData.description);
              xmlWriter.writeEndElement();
              xmlWriter.writeStartElement("online-flag");
                xmlWriter.writeCharacters(pricebookData.onlineFlag);
              xmlWriter.writeEndElement();
            xmlWriter.writeEndElement();
          xmlWriter.writeStartElement("price-tables");
            for (let i = 0; i < productAmount; i++) {
                xmlWriter.writeStartElement("price-table");
                  xmlWriter.writeAttribute("product-id", priceTables['price-table'][i]["@product-id"]);
                  xmlWriter.writeStartElement("amount");
                    xmlWriter.writeAttribute("quantity", priceTables['price-table']["amount"]["@quantity"]);
                    xmlWriter.writeCharacters(priceTables['price-table'][i]["amount"] *= 2);
                  xmlWriter.writeEndElement();
                xmlWriter.writeEndElement();
            }
          xmlWriter.writeEndElement();
        xmlWriter.writeEndElement();  
        xmlWriter.writeEndDocument();

        xmlWriter.close();
        xmlFileWriter.close();

    } catch (e) {
        Logger.error('importDoublePrices.js has failed reading the pricebook XML with the following error: ' + e.message);
    };
};

module.exports = {
    doublePrices: doublePrices
};