'use strict';

/*!
 * clack: a node.js websocket server
 * Copyright(c) 2016 Suhail Gupta <suhailgupta03@gmail.com>
 * MIT Licensed
 */

var HttpClient = require("./HttpClient")
  , httpClient = new HttpClient("127.0.0.1",5984)
  , EventEmitter = require("events").EventEmitter
  , util = require("util");

/**
 * Couche Pipe implementation
 *
 * @constructor
 * @param {String} address IP address running the CoucheDB
 * @param {Integer} port Port running CoucheDB
 * @api public
 */
var CouchePipe = function(address,port) {
    this.url = address;
    this.port = port;
    this.database = null;
}
 
/**
 * Inherits from EventEmitter
 */

util.inherits(CouchePipe,EventEmitter);

/**
 * Set the address/ip running Couche Database
 * @param {String} address IP address of the server
 * return {Boolean|Object}
 */
CouchePipe.prototype.setAddress = function(address) {
    if("string" !== typeof address)
        return false;
    this.url = address;
    return this;
}

/**
 * Set the address/ip running Couche Database
 * @param {Integer} port Port on which the database is running
 * return {Boolean|Object}
 */
CouchePipe.prototype.setPort = function(port) {
    if("integer" !== typeof port)
        return false;
    this.port = port;
    return this;
}

/**
 * Selects the database, over which the subsequent queries will be performed
 * @param {String} database Name of the database to use
 * @return {Boolean|Object}
 */
CouchePipe.prototype.useDatabase = function(database) {
    if("string" !== typeof database)
        return false;
    this.database = database;
    return this;
}

/**
 * Creates a new database on the CoucheDB server
 * @param {String} newDatabase Database to create
 * @return {Boolean|Object}
 */
CouchePipe.prototype.createDatabase = function(newDatabase) {
    if("string" !== typeof newDatabase)
        return false;
    var path = `/${newDatabase}`;
    httpClient.sendPut(path);
}

/**
 * Deletes the database permanently from the disk
 * Sample DELETE request curl -X DELETE http://127.0.0.1:5984/database_name
 * @param {String} database Name of the database
 * @return {Boolean}
 * @return {Object}
 */
CouchePipe.prototype.deleteDatabase = function(database){
   if("string" !== typeof database) 
       return false;
    var path = `/${database}`;
    httpClient.sendDelete(path);
}

/**
 * Get the document from the database
 * Sample CURL request curl -X GET http://localhost:5984/sukhanvar/5f5db394cc793d969c12fe8546000817
 * @param {String} documentID Generated document id
 */
CouchePipe.prototype.getDocument = function(documentID) {
    if("string" !== typeof documentID)
        return false;
    var path  = `/${this.database}/${documentID}`;
    httpClient.sendGet(path);
}

/**
 * Creates a document in the database already selected
 * @param {String} id ID that will be generated for the document
 * @param {object} dataObject Data object that will be inserted into the database
 * @return {Boolean}
 * @return {object}
 */
CouchePipe.prototype.createDocument = function(id,dataObject) {
    if(!this.database || "string" !== typeof id || "object" !== typeof dataObject)
        return false;
    var path = `/${this.database}/${id}`;
    var json = JSON.stringify(dataObject);
    httpClient.sendPut(path,json);
}

/**
 * Updates the document in the database
 * @param {String} id ID of the document to be updated
 * @param {object} dataObject Data to be updated
 * @return {boolean}
 * @return {object}
 */
CouchePipe.prototype.updateDocument = function(id,dataObject){
    if(!this.database || "string" !== typeof id || "object" !== typeof dataObject)
        return false;
    var that = this;
    // Get the current revision number before running the update
    this.getRevisionNumber(id);
    this.on("_rev",function(revID,status) {
        dataObject['_rev'] = revID; 
        var path = `/${that.database}/${id}`;
        var json = JSON.stringify(dataObject);
        // Send the update request for id where _rev = revID
        httpClient.sendPut(path,json);
    });
}

/**
 * Permanently deletes a document from the database
 * Sample DELETE document request 
 * <code>curl -X DELETE http://127.0.0.1:5984/database_name/database_id?_rev</code>
 * @param {String} id _id of the document
 * @return {boolean} 
 * @return {object}
 */
CouchePipe.prototype.deleteDocument = function(id) {
    if("string" !== typeof id)
        return false;
    var that = this;
    // Get the current revision number to be sent with the request
    this.getRevisionNumber(id);
    this.on("_rev",function(revID,status) {
        var path = `/${this.database}/${id}?rev=${revID}`;
        httpClient.sendDelete(path);
    });
}
     
/**
 * Get the revision number for the document. 
 * Emits _rev event when the revision number has been 
 * fetched from the database.
 * @param {String} id _id for which the revision number is seeked
 * @return {boolean} false on call failure
 */
CouchePipe.prototype.getRevisionNumber = function(id){
    if("string" !== typeof id)
        return false;
    var that = this;
    // The local variable 'hc' is created because the call backs
    // for httpClient are registered globally, and in order to 
    // get _rev before sending an update request, it is necessary 
    // to listen for the event in the local scope
    var hc = new HttpClient(this.url,this.port);
    var path = `/${this.database}/${id}`;
    hc.sendGet(path);
    hc.on("downstream",function(data,response) {
        if(data) {
            var dataReceived = JSON.parse(data);
            var revID = dataReceived._rev;
            that.emit("_rev",revID,200);
        }
    });   
}

// -- Global HttpClient Events --

httpClient.on("downstream",function(chunk,response) {
    console.log(chunk);
});

httpClient.on("complete",function(response) {
    console.log("response complete");
});

// -- HttpClient Event Handling Ends --

//Exports
module.exports = CouchePipe;