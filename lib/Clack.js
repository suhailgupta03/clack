'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var util = require("util")
  , EventEmitter = require("events").EventEmitter
  , CHttpServer = require("./CHttpServer").CHttpServer
  , SocketServer = require("./SocketServer").SocketServer;
 
/**
 * Clack implementation
 *
 * @constructor
 * @param {Integer} port Port to bind the HTTP Server
 * @param {Integer} port Port to bind the WebSocket Server
 * @param {Object} options Additional connection options.
 * @api public
 */

function Clack(httpPort,webSocketPort,options) {
    this.httpPort = ("integer" == typeof httpPort) ? httpPort : 3000;
    this.socketPort = ("integer" == typeof webSocketPort) ? webSocketPort : 3001;
    this.options = ("object" === typeof options) ? options : {};
    return new Clack(this.httpPort, this.socketPort, this.options);
}

/**
 * Inherits from EventEmitter
 */

util.inherits(Clack,EventEmitter);

/**
 * Ready States
 */
["RUNNING","CLOSING","CLOSED","STARTING"]. forEach(function(state,index) {
   Clack.prototype[state] = index;
});

/**
 * Starts HTTP Server by invoking a method of CHttpServer class
 */
Clack.prototype.startHTTPServer = function() {
    var hserver = new CHttpServer(this.httpPort);
    hserver.start();
};

/**
 * Stops HTTP Server by invoking a method of CHttpServer class
 */
Clack.prototype.stopHTTPServer = function() {
    var hserver = new CHttpServer(this.httpPort);
    hserver.stop();
};

/**
 * Starts the Socket Server by invoking a method of SocketServer class
 */
Clack.prototype.startSocketServer = function() {
    var sserver = new SocketServer(this.socketPort);
};

/**
 * Stops the Socket Server by invoking a method of SocketServer class
 */
Clack.prototype.stopSocketServer = function() {
    
};

//Exports
module.exports = Clack;