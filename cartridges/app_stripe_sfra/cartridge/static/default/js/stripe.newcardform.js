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
/******/ 	return __webpack_require__(__webpack_require__.s = "./cartridges/app_stripe_sfra/cartridge/client/default/js/stripe.newcardform.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./cartridges/app_stripe_sfra/cartridge/client/default/js/stripe.newcardform.js":
/*!**************************************************************************************!*\
  !*** ./cartridges/app_stripe_sfra/cartridge/client/default/js/stripe.newcardform.js ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* eslint-disable no-alert */\n/* eslint-disable no-plusplus */\n/* eslint-disable require-jsdoc */\n/* globals Stripe, $ */\n\n\n\n// v1\nvar $form = $('.payment-form');\nvar stripe = Stripe(document.getElementById('stripePublicKey').value);\nvar elements = stripe.elements();\n\nfunction setCustomCardOutcome(result) {\n    var displayError = document.getElementById('card-errors');\n    if (result.error) {\n        displayError.textContent = result.error.message;\n    } else {\n        displayError.textContent = '';\n    }\n}\n\nvar cardBrandToPfClass = {\n    visa: 'pf-visa',\n    mastercard: 'pf-mastercard',\n    amex: 'pf-american-express',\n    discover: 'pf-discover',\n    diners: 'pf-diners',\n    jcb: 'pf-jcb',\n    unknown: 'pf-credit-card'\n};\n\nfunction setCustomCardBrandIcon(brand) {\n    var brandIconElement = document.getElementById('brand-icon');\n    var pfClass = 'pf-credit-card';\n    if (brand in cardBrandToPfClass) {\n        pfClass = cardBrandToPfClass[brand];\n    }\n\n    for (var i = brandIconElement.classList.length - 1; i >= 0; i--) {\n        brandIconElement.classList.remove(brandIconElement.classList[i]);\n    }\n    brandIconElement.classList.add('pf');\n    brandIconElement.classList.add(pfClass);\n}\n\nvar cardElement = null;\nvar cardNumberElement = null;\n\nif (document.getElementById('card-element')) {\n    cardElement = elements.create('card', { style: $form.data('element-style') });\n    cardElement.mount('#card-element');\n} else if (document.getElementById('stripe-custom-card-group')) {\n    var style = JSON.parse(document.getElementById('stripe-custom-card-group').dataset.elementstyle);\n\n    cardNumberElement = elements.create('cardNumber', {\n        style: style\n    });\n    cardNumberElement.mount('#card-number-element');\n\n    var cardExpiryElement = elements.create('cardExpiry', {\n        style: style\n    });\n    cardExpiryElement.mount('#card-expiry-element');\n\n    var cardCvcElement = elements.create('cardCvc', {\n        style: style\n    });\n    cardCvcElement.mount('#card-cvc-element');\n\n    cardNumberElement.on('change', function (event) {\n        // Switch brand logo\n        if (event.brand) {\n            setCustomCardBrandIcon(event.brand);\n        }\n\n        setCustomCardOutcome(event);\n    });\n}\n\n$('button[type=\"submit\"]').on('click', function (e) {\n    e.preventDefault();\n    var stripeCardEl = (!cardElement) ? cardNumberElement : cardElement;\n    stripe.createPaymentMethod('card', stripeCardEl, {\n        billing_details: {\n            name: $('#cardOwner').val()\n        }\n    }).then(function (result) {\n        if (result.error) {\n            alert(result.error.message);\n        } else {\n            var paymentMethodId = result.paymentMethod.id;\n            $.ajax({\n                url: $form.attr('action'),\n                method: 'POST',\n                data: {\n                    payment_method_id: paymentMethodId,\n                    csrf_token: $('[name=\"csrf_token\"]').val()\n                }\n            }).done(function (msg) {\n                if (msg.success) {\n                    window.location.href = $form.data('wallet-url');\n                } else {\n                    alert(msg.error);\n                }\n            }).fail(function (msg) {\n                if (msg.responseJSON.redirectUrl) {\n                    window.location.href = msg.responseJSON.redirectUrl;\n                } else {\n                    alert(msg);\n                }\n            });\n        }\n    });\n});\n\n\n//# sourceURL=webpack:///./cartridges/app_stripe_sfra/cartridge/client/default/js/stripe.newcardform.js?");

/***/ })

/******/ });