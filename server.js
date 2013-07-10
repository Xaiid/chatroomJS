//variable declarations

var http  = require('http');
var fs    = require('fs');
var path  = require('path');
var mime  = require('mime');
var cache = {};

//Error responses
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}
//Serves file data
function sendFile(response, filePath, fileContents) {
  response.writeHead(200,{"content-type": mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

//Accessing memory storage (RAM) is faster than accessing the filesystem, 
//determines whether or not a file is cached and, if so, serves it.
//If a file isn’t cached, it’s read from disk and served. 
//If the file doesn’t exist, an HTTP 404 error is returned as a response.

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists) {
      if (exists) {
        fs.readFile(absPath, function(err, data) {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    }); }
}
// Creating HTTP server
var server = http.createServer(function(request, response) {
  var filePath = false;
  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

//Run HTTP server

server.listen(3000, function() {
  console.log("Server listening on port 3000")
});

//Setting up the Socket.IO server
var chatServer = require('./lib/chat_server');
chatServer.listen(server);

