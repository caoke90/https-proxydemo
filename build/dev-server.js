
const path = require('path');
const express = require('express');
// default port where dev server listens for incoming traffic
const port = process.env.PORT || 80;



const app = express();


const fs = require("fs")


app.use("/", express.static(__dirname+'/../../dist'));

function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces) {
        var iface = interfaces[devName];
        for(var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}


const readyPromise = new Promise(resolve => {

    var uri = 'http://' + getIPAdress() + ':' + port;
    console.log('> Listening at ' + uri + '\n');

});
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync(__dirname+'/private.pem', 'utf8');
var certificate = fs.readFileSync(__dirname+'/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

var SSLPORT = 443;

httpServer.listen(port, function() {
    console.log('HTTP Server is running on: http://localhost:%s', port);
});
httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

module.exports = {
	ready: readyPromise,
	close: () => {
        console.log("close")

	}
};
