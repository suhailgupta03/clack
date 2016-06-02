'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var util = require("util");

function Logger(message,severity,onFile) {
    this.message = message;
    this.severity = severity;
    this.onFile = (onFile === typeof "boolean") ? onFile : false;
};


Logger.prototype[-1] = "Fatal Error";
Logger.prototype[0] = "Info";
Logger.prototype[1] = "Warning";
Logger.prototype[2] = "Notice";

Logger.prototype.setMessage = function(message) {
    this.message = message;
    return this;
};

Logger.prototype.setSeverity = function(severity) {
    this.severity = severity;
    return this;
};

Logger.prototype.log = function() {
    if(!this.message || !this[this.severity]) {
        return new Error("Message or severity not set");
    }
    // Log to console by default
    util.log(`${this[this.severity]}: ${this.message}`);
    // If true also log the message on file
    if(this.onFile) {
        
    }
    
    return true;
}

//Exports
module.exports = Logger;