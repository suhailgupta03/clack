'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

/**
 * Provides the base Clack class
 * @module Clack
 */

var util = require("util")
  , EventEmitter = require("events").EventEmitter
  , CHttpServer = require("./CHttpServer")
  , SocketServer = require("./SocketServer")
  , Logger = require("./Logger");
 
/**
 * Clack implementation
 * @class Clack
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
    /**
     * Listen for HTTP Server Started Event
     */
    hserver.on("hstarted",function(message,status) {
        var infoLogger = new Logger(`${message} : Status ${status}`,0);
        infoLogger.log();
    });
};

/**
 * Stops HTTP Server by invoking a method of CHttpServer class
 */
Clack.prototype.stopHTTPServer = function() {
    var hserver = new CHttpServer(this.httpPort);
    hserver.stop();
    /**
     * Listen for HTTP Server Stopped Event
     */
    hserver.on("hstopped",function(message,status) {
        var warningLogger = new Logger(`${message} : Status ${status}`,1);
        warningLogger.log();
    });
};

/**
 * Starts the Socket Server by invoking a method of SocketServer class
 */
Clack.prototype.startSocketServer = function() {
    // Creating the object starts the server on this.socketPort
    var sserver = new SocketServer(this.socketPort);
    // Calling activateListeners on SocketServer instance, activates 
    // all the event listeners associated with SocketServer
    sserver.activateListeners();
    var infoLogger = new Logger();
    infoLogger.setSeverity(0);
    sserver.on("newsocket",function(socket,status) {
        infoLogger.setMessage(`New socket opened: ${socket}`).log();
        sserver.on("newmessage",function(message,status) {
            infoLogger.setMessage(`New message received: ${message}`).log();
        });
    });
};

/**
 * Stops the Socket Server by invoking a method of SocketServer class
 */
Clack.prototype.stopSocketServer = function() {
    
};

//Exports
module.exports = Clack;