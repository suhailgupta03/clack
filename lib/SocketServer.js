'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var WebSocketServer = require("ws").Server
  , EventEmitter = require("events").EventEmitter
  , util = require("util")
  , os = require("os")
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
 * Action Map 
 */
SocketServer.prototype['oto_message'] = 'sendMessage';

/**
 * Activate the listeners to be associated with SocketServer class
 * Emits 'newsocket', 'newmessage' events
 */
SocketServer.prototype.activateListeners = function() {
    var that = this;
    this.socketServer.on("connection",function(socket) {
        that.emit("newsocket",socket,200);
        socket.on("message",function(message) {
            if(!socket.userAttached) {
                try {
                    var object = JSON.parse(message);   
                }catch(e) {
                    var exception = "Invalid JSON found while trying to get the username" + os.EOL + e.stack;
                    throw exception;
                }
                if(object.username)
                    socket.userAttached = object.username; // Attach the username with the server socket
            } 
            try {
                var o = JSON.parse(message);
                if(o.action) {
                    // Cater to the request
                    that.mapTo(o.action,o);
                }
            }catch(e){
                throw e;
            }
            var msgObj = {'socket' : socket, 'message' : message};
            that.emit("newmessage",msgObj,200); 
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
        this.socketServer.clients.forEach(function(client) {
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
    user.associateCouchePipe(this.couchePipe).exists(memberId);
    var onFoundCallback = (data,status) => {
        // User exists and can be assigned to the broadcast group
        // But before its needs to be checked, if the user has already been added 
        // to the group
        user.isPresentInBroadcastGroup(memberId,groupName);
        user.on("isPresentInBroadcastGroup", (groupSize,status) => {
            // User was already present in the broadcast group
            logger.setMessage("User already present in the broadcast group!").setSeverity(2).log();
        });
        
        user.on("isAbsentFromBroadcastGroup", (groupSize,status) => {
            // User was not found in the group and can be added
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
        
        user.on("cerror", (data,status) => {
            logger.setMessage(data).setSeverity(-1).log();
        });
    }       
    var onMissingCallback = (data,status) => {
        // User is not yet registered
        logger.setMessage("User not found!").setSeverity(-1).log();
    }
    user.on("found",onFoundCallback);
    user.on("missing",onMissingCallback);
};

/**
 * Delete a member or list of members from the broadcast group
 * @param {Object} memberObject 
 */
SocketServer.prototype.deleteFromBroadcastGroup = function(memberObject) {
    
};

/**
 * Send a personal message to another user
 * Emits 'messagesent' event on success
 * @param {String} senderID   Sender of the message
 * @param {String} receiverID Receiver of the message
 * @param {String} message    Message that will be sent
 * @return {object} error
 */
SocketServer.prototype.sendMessage = function(senderID, receiverID, message) {
    if("string" !== typeof senderID || "string" !== typeof receiverID)
        return new Error("Invalid sender or receiver id passed");
    var receiverFound = false;
    this.socketServer.clients.forEach(function(socket) {
        if(socket.userAttached && socket.userAttached == receiverID) {
            receiverFound = true;
            socket.send(message);
        }
    });
    if(receiverFound) {
        var o = {'sender' : senderID, 'receiver' : receiverID};
        this.emit("messagesent",o,200);
    }else {
        return new Error("Incorrect receiverID or the user is offline");
    }
    
};

/**
 * Map the action string to the appropriate function
 * @param {string} action Action name
 * @param {object} message object (optional)
 */
SocketServer.prototype.mapTo = function(action,messageObject) {
    if(SocketServer.prototype[action]) {
        if(action == 'oto_message') {
            this.sendMessage(messageObject.from, messageObject.to, messageObject.message);    
        }
    }
}

// Exports
module.exports = SocketServer;