'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var WebSocketServer = require("ws").Server
  , EventEmitter = require("events").EventEmitter
  , util = require("util")
  , Logger = require("./Logger")
  , CouchePipe = require("./CouchePipe")
  , User = require("./User");


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
 * Associates instance of CouchePipe with the instance of SocketServer
 * @param {object} couchePipe Instance of CouchePipe class to be associated with
 */
SocketServer.prototype.associateCouchePipe = function(couchePipe) {
    if(!(couchePipe instanceof CouchePipe))
        return new Error("Incorrect parameter passed");
    this.couchePipe = couchePipe;
    return this;
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
 * Create a broadcast group. Creates an empty list of usersAttached by default.
 * Each broadcast group or channel is created in the public namespace. So, each
 * broadcast group/channel created is unique by its name.
 * @param {object} groupOject Group object that contains groupName to be created
 */
SocketServer.prototype.createBroadcastGroup = function(groupOject) {
    if("object" !== typeof groupOject || !groupOject.groupName.trim())
        return new Error("Invalid parameter passed");
    if(!this.couchePipe)
        return new Error("Couche Pipe has not been initialized");
    
    var groupName = groupOject.groupName;
    // Unset the groupName before saving the object into the database
    // Not unsetting will make the groupName redundant
    delete(groupOject['groupName']);
    // Associate an empty array field with groupObject
    // Will be used later to insert user to its index
    groupOject.usersAttached = [];
    var logger = new Logger();
    this.couchePipe.createDocument(groupName,groupOject);
    this.couchePipe.on("dcreated",function(chunk,response) {
        logger.setMessage("Broadcast group has been created").setSeverity(0).log();
    });
    this.couchePipe.on("dcfailed",function(chunk,response) {
        logger.setMessage("Failed to create broadcast group").setSeverity(-1).log();
    });
};

/**
 * Permanently delete a broadcast group
 * @param {String} groupName 
 */
SocketServer.prototype.deleteBroadcastGroup = function(groupName) {
    
};

/**
 * Add a member or list of members to the broadcast group
 * @param {String} groupName Name of the group that has to be updated
 * @param {String} memberId Document ID of the member associated with the group
 */
SocketServer.prototype.addToBroadcastGroup = function(groupName,memberId) {
    if("string" !== typeof memberId || "string" !== typeof groupName)
        return new Error("Invalid parameters passed");
    if(!this.couchePipe)
        return new Error("Couche pipe has not been initialized");
    // Update the broadcast group with the memberId
    var that = this;
    var user = new User();
    var logger = new Logger();
    var tempCp = new CouchePipe(this.couchePipe.url,this.couchePipe.port);
    tempCp.useDatabase(this.couchePipe.database);
    // tempCp is created utilized for a call to exists.
    // Both partialUpdate and exists internally call getDocument method
    // of CouchePipe. So, to avoid the callback function being called
    // multiple times, it is necessary to create a temporary couche pipe
    // to check if the user exists
    user.associateCouchePipe(tempCp).exists(memberId);
    user.on("found",function(data,status) {
        // User exists and can be assigned to the broadcast group
        this.couchePipe.partialUpdate(groupName,"usersAttached",null,memberId);
        this.couchePipe.on("dpupdated",function(chunk,response) {
            logger.setMessage("User assigned the broadcast group").setSeverity(0).log();
        });
        this.couchePipe.on("dpufailed",function(chunk,response) {
            logger.setMessage("Failed to assign to broadcast group").setSeverity(-1).log();
        });
        this.couchePipe.on("dpuerror",function(chunk,response) {
            logger.setMessage("Failed to assign to broadcast group").setSeverity(-1).log();
        });
    });
    
    user.on("missing",function(data,status) {
        // User is not yet registered
        logger.setMessage("User not found!").setSeverity(-1).log();
    });
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