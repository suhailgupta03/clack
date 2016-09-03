
var Clack = require("./lib/Clack");
var CHttpServer = require("./lib/CHttpServer");
var Logger = require("./lib/Logger");
var SocketServer = require("./lib/SocketServer");
var CouchePipe = require("./lib/CouchePipe");
var User = require("./lib/User");

var sserver = new SocketServer(3000);
sserver.activateListeners();

var httpServer = new CHttpServer(3001);
httpServer.setRoot("./public/");
httpServer.start();


var cpipe = new CouchePipe("localhost",5984);
cpipe.useDatabase("sukhanvar");

sserver.associateCouchePipe(cpipe);
//sserver.createBroadcastGroup({"groupName" : "d125"});
//sserver.addToBroadcastGroup("d125","suhailgupta03@gmail.com");
//sserver.addToBroadcastGroup("d125","suhailgupta03@hotmail.com");

sserver.broadcast("rama rama oh rama","d125");

var infoLogger = new Logger();
infoLogger.setSeverity(0);

sserver.on("newsocket",function(socket,status) {
    infoLogger.setMessage(`New socket opened: ${socket}`).log();
});

sserver.on("newmessage",function(message,status) {
    infoLogger.setMessage(`New message received: ${message}`).log();
});
