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
 * Emits dfetched event, when the document has been fetched
 * Sample CURL request curl -X GET http://localhost:5984/sukhanvar/5f5db394cc793d969c12fe8546000817
 * @param {String} documentID Generated document id
 * @return {object}
 */
CouchePipe.prototype.getDocument = function(documentID) {
    if("string" !== typeof documentID)
        return new Error("Invalid parameter passed");
    var path  = `/${this.database}/${documentID}`;
    var hc = new HttpClient(this.url,this.port);
    hc.sendGet(path);
    var that = this;
    hc.on("downstream",function(chunk,response){
        var object = JSON.parse(chunk);
        if(object.error)
            that.emit("derror",chunk,response);
        else
            that.emit("dfetched",chunk,response);
    });
    return this;
}

/**
 * Creates a document in the database already selected
 * Emits dcreated,dcfailed event
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
    var hc = new HttpClient(this.url,this.port);
    var that = this;
    hc.sendPut(path,json);
    hc.on("downstream",function(chunk,response) {
        var object = JSON.parse(chunk);
        if(object.error)
            that.emit("dcfailed",chunk,response);
        else
            that.emit("dcreated",chunk,response);
    });
}

/**
 * Updates the document in the database.
 * It removes all the previous entries and updates with the data object supplied.
 * Emits dupdated,dfupdate events
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
        var hc = new HttpClient(this.url,this.port);
        hc.sendPut(path,json);
        hc.on("downstream",function(chunk,response) {
            var object = JSON.parse(chunk);
            if(object.error)
                that.emit("dfupdate",chunk,response);
            else
                that.emit("dupdated",chunk,response);
        });
    });
}

/**
 * Performs a partial update operation.
 * @param {String} id ID of the document to be updated
 * @param {String} field Document field to update
 * @param {String} key Key over which the object passed will be appended (Optional)
 * @param {mixed} data Data that will be appended to key.
 * @return {object}
 * Example json for Punjab:
 * <code>
 * {
 *      "country" : "India" , "international_border" : "Pakistan" , 
 *      "rivers" : ["Data" : {"Name" : "Ravi"} ,{"Name" :  "Jhelum"} ,{"Name" : "Satluj"} , {"Name" : "Chenab"}],
 *      "area" : "71,818 sq m"
 * }
 * </code>
 * Here field could be 'rivers', value of key could be 'Data' and dataObject to be inserted could 
 * have a value {"Name" : "Beas"}
 * So, after update the value for field 'rivers' will become
 * ["Data" : {"Name" : "Ravi"} ,{"Name" :  "Jhelum"} ,{"Name" : "Satluj"} , {"Name" : "Chenab"}, {"Name" : "Beas"}]
 */
CouchePipe.prototype.partialUpdate = function(id,field,key,data) {
    if("string" !== typeof id || "string" !== typeof field || !data) {
        return new Error("Invalid parameters passed");
    }
    // Get the document, to append dataObject to
    this.getDocument(id);
    this.on("dfetched",function(chunk,response) {
        var doc = JSON.parse(chunk);
        if(doc[field]) {
            // Field exists
            if(doc[field][key] && Array.isArray(doc[field][key])) {
                // If the key exists within the field
                // append data to field.key array
                doc[field][key][doc[field][key].length] = data;
            }else if(Array.isArray(doc[field])){
                // If the value corresponding to the field is array
                // append the value at last array index
                doc[field][doc[field].length] = data;
            }else {
                // If key doesn't exist, append the value passed 
                // separated by a comma (,)
                if("object" === typeof doc[field])
                     doc[field] = JSON.stringify(doc[field]);
                if("object" === typeof data)
                    data = JSON.stringify(data);
                doc[field] = `${doc[field]},${data}`;
            }
            // After the selected field has been updated, locally
            // push the changes to the server document
            this.updateDocument(id,doc);
            this.on("dupdated",function(chunk,response) {
                // Emit the corresponding event, after the document
                // has been partially updated
                this.emit("dpupdated",chunk,response);
            });
            this.on("dfupdate",function(chunk,response) {
               this.emit("dpufailed",chunk,response); 
            });
        }else {
            this.emit("dpuerror","Missing field in the document",400);
        }
    });
    
    this.on("derror",function(chunk,response) {
        this.emit("dpuerror",chunk,response);
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