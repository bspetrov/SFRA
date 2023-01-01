/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./cartridges/app_stripe_sfra/cartridge/client/default/js/stripe.cart.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./cartridges/app_stripe_sfra/cartridge/client/default/js/stripe.cart.js":
/*!*******************************************************************************!*\
  !*** ./cartridges/app_stripe_sfra/cartridge/client/default/js/stripe.cart.js ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* global stripe, stripeAccountCountry, stripeShippingOptions, elements, serviceUrl, $ */\n\n\n\n/**\n * Init Payment Request Button\n */\nfunction initPRB() {\n    var stripeOrderAmountInput = document.getElementById('stripe_order_amount');\n    var stripeOrderCurrencyInput = document.getElementById('stripe_order_currency');\n    var amountToPay = parseFloat(stripeOrderAmountInput.value);\n    var currencyCode = stripeOrderCurrencyInput.value && stripeOrderCurrencyInput.value.toLowerCase();\n\n    var paymentRequest = stripe.paymentRequest({\n        country: stripeAccountCountry,\n        currency: currencyCode,\n        total: {\n            label: 'Order total',\n            amount: amountToPay\n        },\n        requestPayerName: true,\n        requestPayerEmail: true,\n        requestPayerPhone: true,\n        requestShipping: true,\n        shippingOptions: stripeShippingOptions\n    });\n\n    var prButton = elements.create('paymentRequestButton', {\n        paymentRequest: paymentRequest\n    });\n\n    // Check the availability of the Payment Request API first.\n    paymentRequest.canMakePayment().then(function (result) {\n        if (result) {\n            prButton.mount('#payment-request-button');\n        } else {\n            document.getElementById('payment-request-button').style.display = 'none';\n        }\n    });\n    paymentRequest.on('paymentmethod', function (ev) {\n        $.ajax({\n            url: serviceUrl,\n            type: 'POST',\n            dataType: 'json',\n            data: ev\n        }).done(function (result) {\n            ev.complete('success');\n            if (result.redirectUrl) {\n                window.location.href = result.redirectUrl;\n            }\n        }).error(function (error) {\n            ev.complete('fail');\n            // v1\n            // eslint-disable-next-line no-console\n            console.log(error);\n        });\n        // console.log(ev);\n        try {\n            document.querySelector('input[name$=\"_email\"]').value = ev.payerEmail;\n            // v1\n            // eslint-disable-next-line no-undef\n            copyNewCardDetails(ev.paymentMethod);\n            ev.complete('success');\n            $('.submit-payment').click();\n        } catch (error) {\n            // v1\n            // eslint-disable-next-line no-console\n            console.log(error);\n            ev.complete('fail');\n        }\n    });\n}\n\nvar prbPlaceholder = document.getElementById('payment-request-button');\nif (prbPlaceholder) {\n    initPRB();\n}\n\n\n//# sourceURL=webpack:///./cartridges/app_stripe_sfra/cartridge/client/default/js/stripe.cart.js?");

/***/ })

/******/ });