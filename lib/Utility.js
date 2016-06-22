'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */


/**
 * Provides the base Utility class
 * @module Utility
 */

/**
 * @class Utility
 */
function Utility() {}

/**
 * Returns a clone of the object, containing
 * the properties/attributes of the object passed.
 * @param {object} object Used to clone a new object
 * @return {object} 
 */
Utility.prototype.clone = function(object) {
    if("object" !== typeof object)
        return new Error("Invalid type passed. Failed to clone");
    var copy = object.constructor();
    for(var attr in object) {
        if(object.hasOwnProperty(attr))
            copy[attr] = object[attr];
    }
    return copy;
}

//Exports
module.exports = Utility;