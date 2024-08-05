'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
const axios = require('axios');

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8010);

var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {

    // MATT adding the part here where we send video request responses
    // if (message.type === 'video-request') {
    // fetch("http://localhost:8083/stream/f29c576b-bbfb-449a-be5a-180fd0a7bedc/channel/0/webrtc", {
    //   method: 'POST',
    //  body: new URLSearchParams({ data: btoa(message) })
    // })
    axios.post('http://localhost:8083/stream/f29c576b-bbfb-449a-be5a-180fd0a7bedc/channel/0/webrtc', new URLSearchParams({ data: btoa(message) }))
      .then(response => response.text())
      .then(data => {
        try {
 
          socket.to(socket.id).emit('message',({ type: 'answer', sdp: atob(data) }))

        } catch (e) {
          console.warn(e)
        }
      })
    // else {
    //  log('Client said: ', message);
    //  // for a real app, would be room-only (not broadcast)
    //  socket.broadcast.emit('message', message);
    //}
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else { // max two clients
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });

});