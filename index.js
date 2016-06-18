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
var User = require("./lib/User");

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

var cpipe = new CouchePipe("localhost",5984);
cpipe.useDatabase("sukhanvar");
//cpipe.getDocument("5f5db394cc793d969c12fe8546000817");
//cpipe.createDatabase("brenda_lee");
//cpipe.deleteDatabase("brenda_lee");
//cpipe.updateDocument("62fa843808a5f78dfc5a43ff67000a25",{
//                                                            "name" : "Daag Dehlvi" , 
//                                                            "Born" : "Delhi" , 
//                                                            "Genre" : "Ghazal,Qasida",
//                                                            "Died" : "Hyderabad"
//                                                        }
//                    );

//cpipe.createDocument("punjab" , {
//                                    "country" : "India" , "international_border" : "Pakistan" , 
//                                    "rivers" : ["Ravi" , "Jhelum" , "Satluj" , "Chenab" , "Beas"],
//                                    "area" : "71,818 sq m"
//                                }
//                    );

//cpipe.deleteDocument("62fa843808a5f78dfc5a43ff67000d59");
//var r = cpipe.partialUpdate("4a631a8d9daa09440b79d9b91a000820","users","data",{"username" : "just_joined"});
//var r = cpipe.partialUpdate("4a631a8d9daa09440b79d9b91a000820","test",null,{"username" : "just_joined"});
//var user = new User({"username" : "suhailgupta03@gmail.com" , "firstname" : "suhail" , "lastname" : "gupta"});
//user.associateCouchePipe(cpipe).registerUser();
var sserver = new SocketServer(3001);
sserver.associateCouchePipe(cpipe);
//sserver.createBroadcastGroup({"groupName" : "ElvisClub"});
sserver.addToBroadcastGroup("ElvisClub","suhailgupta03@hotmail.com");