'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

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
    if("object" !== typeof userObject)
        return new Error("Parameter must be an object");
    if(!userObject.username.trim() || !userObject.firstname.trim())
        return new Error("username or firstname missing");
    this.userObject = userObject;
}

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
 * Saves the user in the database
 * @return {Integer} Last record inserted
 */
User.prototype.registerUser = function() {
    if("string" !== typeof this.username)
        return new Error("Invalid username found");
    // Write the user details in the database
    
    
}

/**
 * Saves the user in the database
 * @return {Boolean} True if updated successfully, false otherwise
 */
User.prototype.updateUser = function() {
    if("string" !== typeof userID.trim())
        return new Error("Invalid UserID");
    // Update the details of this.username in the database
}

/**
 * Permanently deletes the user from the database
 * @return {Boolean} True if deleted successfully, false otherwise
 */
User.prototype.deleteUser = function() {
     if("string" !== typeof userID.trim())
        return new Error("Invalid UserID");
    // Permanently delete the user from the database
}

//Exports
module.exports = User;