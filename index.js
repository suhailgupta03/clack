/**
* A test file
* @author Suhail
* @license MIT
*/

var Clack = require("./lib/Clack");

var httpPort = 4000;
var webSocketPort = 4001;
var clack = new Clack(httpPort,webSocketPort);
clack.startHTTPServer();