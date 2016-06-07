/**
* A test file
* @author Suhail
* @license MIT
*/

var Clack = require("./lib/Clack");
var CHttpServer = require("./lib/CHttpServer");
var Logger = require("./lib/Logger");
var SocketServer = require("./lib/SocketServer");
var CouchePipe = require("./lib/CouchePipe");

var httpPort = 4000;
var webSocketPort = 4001;

//var clack = new Clack(httpPort,webSocketPort);
//clack.startHTTPServer();
//clack.startSocketServer();

//var hserver = new CHttpServer(httpPort);
//hserver.setRoot("./public/");
//hserver.start();
///**
// * Listen for HTTP Server Stopped Event
// */
//hserver.on("hstarted",function(message,status) {
//    var infoLogger = new Logger(`${message} : Status ${status}`,0);
//    infoLogger.log();
//});
//
//// Creating the object starts the server on this.socketPort
//var sserver = new SocketServer(webSocketPort);
//// Calling activateListeners on SocketServer instance, activates 
//// all the event listeners associated with SocketServer
//sserver.activateListeners();
//var infoLogger = new Logger();
//infoLogger.setSeverity(0);
//sserver.on("newsocket",function(socket,status) {
//    infoLogger.setMessage(`New socket opened: ${socket}`).log();
//});
//
//sserver.on("newmessage",function(message,status) {
//    infoLogger.setMessage(`New message received: ${message}`).log();
//});

var cpipe = new CouchePipe();
cpipe.useDatabase("sukhanvar");
cpipe.getDocument("5f5db394cc793d969c12fe8546000817");
//cpipe.createDatabase("brenda_lee");
cpipe.deleteDatabase("brenda_lee");