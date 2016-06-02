'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var express = require("express")
  , httpServer = express()
  , EventEmitter = require("events").EventEmitter
  , util = require("util");


/**
 * Clack HTTP Server Abstraction
 *
 * @constructor
 * @param {Integer} port Port to bind the HTTP Server
 * @api public
 */
function CHttpServer(port) {
    this.port = port;
}

/**
 * Inherits from EventEmitter 
 */
util.inherits(CHttpServer, EventEmitter);

/**
 * Starts the HTTP Server
 */
CHttpServer.prototype.start = function() {
    var that = this;
    httpServer.listen(this.port,function() {
        that.emit("hstarted",`HTTP Server Listening On Port ${that.port}`,200);
    });
};

/**
 * Stops the HTTP Server
 */
CHttpServer.prototype.stop = function() {
    httpServer.close();
    this.emit("hstopped","Server Stopped!",200);  
};

// Exports
module.exports = CHttpServer;