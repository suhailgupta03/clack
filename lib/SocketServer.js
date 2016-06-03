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
    // Starts WebSocket Server
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

/**
 * Broadcast the message to all connected to the WebSocket Server
 * @param {String} message Message that has to be broadcasted
 * @param {String} groupName Name of the group to which the message has to be broadcasted
 * @return {Error|Boolean}
 */
SocketServer.prototype.broadcast = function(message, groupName) {
    if(!message && "string" !== typeof message.trim())
        return new Error("Cannot broadcast an empty string");
    if(!groupName) {
        // Broadcast to all connected to the WebSocket Server
        this.socketServer.forEach(function(client) {
           client.send(`~Broadcast: ${message}`); 
        });
        // Emit a beamed event, when the broadcast has been made
        this.emit("beamed",this.socketServer,200);
    }else {
        // Broadcast to the particular group
    }
    return true;
};

/**
 * Create a broadcast group
 * @param {String} groupName Name of the group that has to be created
 */
SocketServer.prototype.createBroadcastGroup = function(groupName) {
    
};

/**
 * Permanently delete a broadcast group
 * @param {String} groupName 
 */
SocketServer.prototype.deleteBroadcastGroup = function(groupName) {
    
};

/**
 * Add a member or list of members to the broadcast group
 * @param {Object} memberObject 
 */
SocketServer.prototype.addToBroadcastGroup = function(memberObject) {
    
};

/**
 * Delete a member or list of members from the broadcast group
 * @param {Object} memberObject 
 */
SocketServer.prototype.deleteFromBroadcastGroup = function(memberObject) {
    
};

/**
 * Send a personal message to another user
 * @param {String} userID Receiver of the message
 * @param {String} message Message that will be sent
 */
SocketServer.prototype.sendMessage = function(userID,message) {
    
};

// Exports
module.exports = SocketServer;