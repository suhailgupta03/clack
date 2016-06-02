'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var WebSocketServer = require("ws").Server
  , EventEmitter = require("events").EventEmitter
  , util = require("util")
  , Logger = require("./Logger");


/**
 * Socket Server implementation
 *
 * @constructor
 * @param {Integer} port Port to bind the WebSocket Server
 * @api public
 */

function SocketServer(port) {
    this.socketPort = port;
    this.socketServer = new WebSocketServer({port: this.socketPort});
    var logger = new Logger(`Socket server started on ${this.socketPort}`,0).log();
}


/**
 * Inherits from WebSocketServer
 */
util.inherits(SocketServer,WebSocketServer);

/**
 * Activate the listeners to be associated with SocketServer class
 */
SocketServer.prototype.activateListeners = function() {
    var that = this;
    this.socketServer.on("connection",function(socket) {
        that.emit("newsocket",socket,200);
        socket.on("message",function(message) {
           that.emit("newmessage",message,200); 
        });
    });
};

/**
 * Starts a socket server on a specified port.
 * The server is started on the port supplied (by default) when the object 
 * is initialized.
 * Call this function to start the socket server on a different port.
 * It first closes and then starts the server on a different port
 */
SocketServer.prototype.restart = function(port) {
    return new SocketServer(port);
};

/**
 * Stops the WebSocket Server
 */
SocketServer.prototype.stop = function() {
    
}


// Exports
module.exports = SocketServer;