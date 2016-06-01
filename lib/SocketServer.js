'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var WebSocketServer = require("ws").Server
  , EventEmitter = require("events").EventEmitter
  , util = require("util");


/**
 * Socket Server implementation
 *
 * @constructor
 * @param {Integer} port Port to bind the WebSocket Server
 * @api public
 */

function SocketServer(port) {
    this.socketPort = port;
    this.socketServer = new WebSocketServer(this.port);
    /**
     * Inherits from EventEmitter
     */
    util.inherits(SocketServer,EventEmitter);
    
    this.socketServer.on("connection",function(socket) {
        this.emit("newsocket",socket,200);
        socket.on("message",function(message) {
           this.emit("newmessage",message,200); 
        });
    });
    
    return new SocketServer(this.socketPort);
}


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

SocketServer.on("newsocket",function(socket,status) {
   util.log(`New socket opened: ${socket}`); 
});

SocketServer.on("newmessage",function(message,status) {
    util.log(`New message received: ${message}`);
});

// Exports
module.exports = SocketServer;