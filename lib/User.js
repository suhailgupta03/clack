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
 * @param {String} userID Username|UserID of the user
 * @api public
 */
function User(userID) {
    this.username = userID;
}

/**
 * Sets the username
 * @param {String} userID Username|UserID of the user
 * @return {this|Error}
 */
User.prototype.setUsername = function(userID) {
    if("string" !== typeof userID.trim())
        return new Error("Invalid UserID");
    this.username = userID;
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