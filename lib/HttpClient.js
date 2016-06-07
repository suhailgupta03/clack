'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var http = require('http')
  , util = require('util')
  , EventEmitter = require("events").EventEmitter
  , queryString = require('querystring');

/**
 * HTTP Client implementation
 *
 * @constructor
 * @param {String} endPoint Location where the request has to be sent
 * @param {String} port Port on which the request will be sent
 * @api public
 */
var HttpClient = function(endPoint,port) {
    this.endPoint = endPoint;
    this.port = port;
    this.protocol = "http:";
}

/**
 * Inherits from EventEmitter
 */
util.inherits(HttpClient,EventEmitter);

/*
 * Set the endpoint for HTTP request
 * @param {String} endPoint End point for the HTTP request
 * @return {Boolean|Object}
 */
HttpClient.prototype.setEndPoint = function(endPoint) {
    if("string" !== typeof endPoint)
        return false;
    this.endPoint = endPoint;
    return this;
}

/*
 * Set the port where the HTTP request will be sent
 * @param {Integer} port Port on which the HTTP request will be attempted
 * @return {Boolean|Object}
 */
HttpClient.prototype.setPort = function(port) {
    if("integer" !== typeof port)
        return false;
    this.port = port;
    return this;
}

/**
 * Set the protocol required to form a request URL. Default
 * is http: 
 * @param {String} protocol protocol to use while making a request
 * @return {Boolean|Object}
 */
HttpClient.prototype.setProtocol = function(protocol) {
    if("string" !== typeof protocol)
        return false;
    this.protocol = protocol;
    return this;
}

/**
 * Sends GET request by forming a complete URL from the parameters 
 * supplied.
 * Example URL that will get formed http://127.0.0.1:5987/sukhanwar/5f5db394cc793d969c12fe85460017e7
 * @param {String} path Request Path
 * @return {Boolean|Object}
 */
HttpClient.prototype.sendGet = function(path) {
     if("string" !== typeof path)
         return false;
    var url = `${this.protocol}//${this.endPoint}:${this.port}/${path}`;
    var that = this;
    http.get(url,function(response){
       response.setEncoding("UTF-8");
        response.on("data",function(chunk) {
            that.emit("downstream",chunk,response);
        });        
        response.on("end",function() {
           that.emit("complete",response); 
        });
    }).end();
    
    return this;
}

/**
 * Sends PUT request
 * Sample PUT request: curl -X PUT http://127.0.0.1:5984/dayaar
 * @param {String} path Request Path
 * @param {String} data JSON to be inserted
 * @return {Boolean|Object}
 */
HttpClient.prototype.sendPut = function(path,data) {
    if("string" !== typeof path)
        return false;
    var that = this;
    http.request({
        hostname: this.endPoint,
        port: this.port,
        protocol: this.protocol,
        method : 'PUT',
        path : path
    },function(response) {
        response.setEncoding("UTF-8");
        response.on("data",function(chunk){
            that.emit("downstream",chunk,response);
        });
        response.on("end",function() {
           that.emit("complete",response); 
        });
    }).end();
    
    return this;
}


/**
 * Send POST request
 */
HttpClient.prototype.sendPost = function(path) {
    if("string" !== typeof path)
        return false;
    var that = this;
    http.request({
        hostname: this.endPoint,
        port: this.port,
        protocol: this.protocol,
        method : 'POST',
        path: path
    },function(response) {
        response.setEncoding("UTF-8");
        response.on("data",function(chunk) {
           that.emit("downstream",chunk,response); 
        });
        response.on("end",function() {
           that.emit("complete",response); 
        });
    }).end();
    return this;
}

/**
 * Send DELETE request
 * Example DELETE request: curl -X DELETE http://127.0.0.1:5984/brenda
 * @param {String} path Path from where the resource will be deleted
 * @return {Boolean|Object}
 */
HttpClient.prototype.sendDelete = function(path) {
    if("string" !== typeof path)
        return false;
    var that = this;
    http.request({
        hostname: this.endPoint,
        port: this.port,
        protocol: this.protocol,
        method : 'DELETE',
        path: path
    },function(response) {
        response.setEncoding("UTF-8");
        response.on("data",function(chunk) {
           that.emit("downstream",chunk,response); 
        });
        response.on("end",function() {
           that.emit("complete",response); 
        });
    }).end();
    return this;
}


//Exports
module.exports = HttpClient;