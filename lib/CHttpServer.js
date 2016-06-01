'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var express = require("express")
  , httpServer = express()
  , EventEmitter = require("events").EventEmitter
  , util = require("util");


function CHttpServer(port) {
    this.port = port;
    return new CHttpServer(port);
}

/**
 * Inherits from EventEmitter 
 */
util.inherits(CHttpServer, EventEmitter);

/**
 * Starts the HTTP Server
 */
CHttpServer.prototype.start = function() {
    httpServer.listen(this.port,function() {
        this.emit("hstarted",`HTTP Server Listening On Port ${this.port}`,200);
    });
};

/**
 * Stops the HTTP Server
 */
CHttpServer.prototype.stop = function() {
    httpServer.close();
    this.emit("hstopped","Server Stopped!",200);  
};

/**
 * Listen for HTTP Server Started Event
 */
CHttpServer.on("hstarted",function(message,status) {
   util.log(`INFO: ${message} : Status ${status}`);
});

/**
 * Listen for HTTP Server Stopped Event
 */
CHttpServer.on("hstopped",function(message,status) {
   util.log(`INFO: ${message} : Status ${status}`);
});

// Exports
module.exports = CHttpServer;