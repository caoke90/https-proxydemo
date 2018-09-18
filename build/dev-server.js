
const path = require('path');
const express = require('express');
// default port where dev server listens for incoming traffic
const port = process.env.PORT || 80;

const mockArr = require("../mock/index.js");

const mockUrl = {}
mockArr.forEach(function(item) {
	Object.assign(mockUrl, item)
})
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));



const list = []
if(mockArr.length) {
	var urlMock = mockArr[0]
	Object.keys(urlMock).forEach(function(url) {
		var mock = urlMock[url];
		list.push({
			key: url,
			value: mock,
		})
	})
}


const fs = require("fs")
const rewrite = require("./rewrite")
Object.keys(mockUrl).forEach(function(url) {
	var mock = mockUrl[url];

    var filepath = path.join(__dirname, "../mock" + mock)
    if(fs.existsSync(filepath)) {
        app.use(url, function(req, res, next) {
            res.jsonp(JSON.parse(fs.readFileSync(filepath).toString()))
        });
    } else {
        app.use(rewrite(url, mock));
    }

});

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

    if(port!==80){
        var uri = 'http://' + getIPAdress() + ':' + port;
        console.log('> Listening at ' + uri + '\n');
	}

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
