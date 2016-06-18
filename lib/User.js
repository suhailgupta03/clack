'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var CouchePipe = require("./CouchePipe")
  , Logger = require("./Logger")
  , EventEmitter = require("events").EventEmitter
  , util = require("util");

/**
 * User Implementation
 *
 * @constructor
 * @param {object} userObject User details. Mandatory keys for user object:
 * - username
 * - firstname
 * <code>
 *   userObject.username = "suhailg03";
 *   userObject.firstname = "suhail";
 * </code>
 * @api public
 */
function User(userObject) {
    this.userObject = userObject;
}

/**
 * Inherits from EventEmitter
 */
util.inherits(User,EventEmitter);

/**
 * Describes the document used to store user details
 */
User.prototype['userdocument'] = "userinfo";

/**
 * Sets the username
 * @param {String} userID Username|UserID of the user
 * @return {this|Error}
 */
User.prototype.setUsername = function(userID) {
    if("string" !== typeof userID.trim())
        return new Error("Invalid UserID");
    this.userObject.username = userID;
    return this;
};

/**
 * Sets the firstname for the user
 * @param {String} firstname First Name of the user
 * @return {object}
 */
User.prototype.setFirstname = function(firstname) {
    if("string" !== typeof firstname)
        return new Error("Invalid firstname");
    this.userObject.firstname = firstname;
    return this;
};

/**
 * Associates the CouchePipe object with the user class.
 * The object will be used in the subsequent requests to 
 * the database
 * @param {object} couchePipe CouchePipe object to associate to
 * @return {object}
 */
User.prototype.associateCouchePipe = function(couchePipe){
    if(!(couchePipe instanceof CouchePipe))
        return new Error("Invalid parameter passed");
    this.couchePipe = couchePipe;
    return this;
}

/**
 * Saves the user in the database
 */
User.prototype.registerUser = function() {
    if("string" !== typeof this.userObject.username)
        return new Error("Invalid username found");
    if("string" !== typeof this.userObject.firstname)
        return new Error("Invalid firstname found");
    if(!this.couchePipe)
        return new Error("CouchePipe has not been initialized");
    var logger = new Logger();
    this.couchePipe.createDocument(this.userObject.username,this.userObject);
    this.couchePipe.on("dcreated",function(chunk,response) {
       logger.setMessage("User document has been created").setSeverity(0).log(); 
    });
    this.couchePipe.on("dcfailed",function(chunk,response) {
       logger.setMessage("Failed to create user document").setSeverity(-1).log(); 
    });
}

/**
 * Saves the user in the database
 */
User.prototype.updateUser = function() {
    if("string" !== typeof userID.trim())
        return new Error("Invalid UserID");
    // Update the details of this.username in the database
}

/**
 * Permanently deletes the user from the database
 */
User.prototype.deleteUser = function() {
     if("string" !== typeof userID.trim())
        return new Error("Invalid UserID");
    // Permanently delete the user from the database
}

/**
 * Tells if the user exists
 * Emits 'found' if the user is found and 'missing' if the user was not found
 * @param {string} userId UserId to check
 * @param {object}
 */
User.prototype.exists = function(userId) {
    if("string" !== typeof userId)
        return new Error("Invalid userId found");
    if(!(this.couchePipe instanceof CouchePipe))
        return new Error("CouchePipe has not been initialized");
    this.couchePipe.getDocument(userId);
    this.couchePipe.once("dfetched",(data,status) => {
        this.emit("found",data,status);
    });
    this.couchePipe.once("derror",(data,status) => {
       this.emit("missing",data,status); 
    });
    return this;
}

/**
 * Tells if the user is present/absent from the broadcast group
 * Emits 'isAbsentFromBroadcastGroup' || 'isPresentInBroadcastGroup' || 'cerror' event
 * @param {string} userId
 * @param {string} groupName
 * @return {object}
 */

User.prototype.isPresentInBroadcastGroup = function(userId,groupName) {
    if("string" !== typeof userId || "string" !== typeof groupName)
        return new Error("Invalid userId or groupName");
    this.couchePipe.getDocument(groupName);
     this.couchePipe.once("dfetched",(data,status) => {
         var object = JSON.parse(data);
         if(Array.isArray(object.usersAttached)) {
             var set = new Set(object.usersAttached);
             var currentSize = set.size;
             set.add(userId);
             var newSize = set.size;
             if(newSize > currentSize) {
                 // User doesn't exist in the broadcast group
                 this.emit("isAbsentFromBroadcastGroup",currentSize,200);
             }else {
                 // newSize equals currentSize
                 // user is already present in the group
                 this.emit("isPresentInBroadcastGroup",currentSize,200);
             }   
         }else {
             this.emit("cerror",data,status); 
         }
    });
    
    this.couchePipe.once("derror",(data,status) => {
       this.emit("cerror",data,status); 
    });
    
    return this;
}

//Exports
module.exports = User;