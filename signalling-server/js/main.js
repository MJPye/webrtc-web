'use strict';

// Variables for WebRTC connection
var isChannelReady = true;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var localConnection;
var remoteConnection;
var sendDataChannel;
var receiveDataChannel;
var pcConstraint;
var dataConstraint;

// HTML elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
var dataChannelSend = document.querySelector('textarea#dataChannelSend');
var dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
var startDataButton = document.querySelector('button#startDataButton');
var sendDataButton = document.querySelector('button#sendDataButton');
var addLocalStreamButton = document.querySelector('button#addLocalStreamButton');
var addRemoteStreamButton = document.querySelector('button#addRemoteStreamButton');
var closeButton = document.querySelector('button#closeButton');

// WebRTC configuration
var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

var constraints = {
  video: true
};

// Button event handlers
startDataButton.onclick = createDataConnection;
addLocalStreamButton.onclick = addLocalStreamChannel;
addRemoteStreamButton.onclick = addRemoteStreamChannel;
sendDataButton.onclick = sendData;
closeButton.onclick = stop;

// Button state control functions
function enableStartDataButton() { startDataButton.disabled = false; }
function disableStartDataButton() { startDataButton.disabled = true; }
function enableAddLocalStreamButton() { addLocalStreamButton.disabled = false; }
function disableAddLocalStreamButton() { addLocalStreamButton.disabled = true; }
function enableAddRemoteStreamButton() { addRemoteStreamButton.disabled = false; }
function disableAddRemoteStreamButton() { addRemoteStreamButton.disabled = true; }
function enableSendDataButton() { sendDataButton.disabled = false; }
function disableSendDataButton() { sendDataButton.disabled = true; }
function enableCloseButton() { closeButton.disabled = false; }
function disableCloseButton() { closeButton.disabled = true; }

// Room and socket connection
var room = 'foo';
var socket = io.connect();

if (room !== '') {
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room);
}

socket.on('created', function (room) {
  console.log('Created room ' + room);
  isInitiator = true;
});

socket.on('full', function (room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room) {
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function (room) {
  console.log('joined: ' + room);
  isChannelReady = true;
});

socket.on('log', function (array) {
  console.log.apply(console, array);
});

// Socket message handling
socket.on('message', function (message) {
  console.log('Client received message:', message);
  if (message === 'initiate_data_transfer') {
    maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  // } else if (message.type === 'answer' && isStarted) {
  } else if (message.type === 'answer') {
    console.log('answer-received')
    //console.log(message)
    const sdpString = message.sdp
    const msgType = message.type
    console.log(msgType)
    console.log(sdpString)
    const description = new RTCSessionDescription({
      type: msgType,
      sdp: sdpString
    });
    pc.setRemoteDescription(description);
    //pc.setRemoteDescription(message);
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

// Send and receive messages through the socket
function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

// WebRTC connection setup
function createDataConnection() {
  console.log("Creating connection Matt")
  // sendMessage('initiate_data_transfer');
  // if (isInitiator) {
  console.log("I am initiator so maybe-starting")
  maybeStart();
  // }
}

if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}

function maybeStart() {
  //console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  // if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
  console.log("I am maybe-starting", isStarted, isChannelReady)
  if (!isStarted && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    // pc.addStream(localStream); //MATT no stream
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

function createPeerConnection() {
  // dataChannelSend.placeholder = '';
  // var servers = null;
  // pcConstraint = null;
  // dataConstraint = null;
  try {
    pc = new RTCPeerConnection({
      iceServers: [{
        urls: ['stun:stun.l.google.com:19302']
      }],
      sdpSemantics: 'unified-plan'
    })
    // sendDataChannel = pc.createDataChannel('sendDataChannel',
    //   dataConstraint);
    //   console.log('Created send data channel');
    console.log('Adding Remotes Early');
    pc.addTransceiver('video', { direction: 'sendrecv' })
    addRemoteStreamChannel(); // MATT added this, maybe remove.
    pc.onicecandidate = handleIceCandidate;
    createDataChannels();
    // pc.onnegotiationneeded = doCall;
    // sendDataChannel.onopen = onSendDataChannelStateChange;
    // sendDataChannel.onclose = onSendDataChannelStateChange;
    // pc.ondatachannel = receiveDataChannelCallback;
    // pc.onaddstream = handleRemoteStreamAdded; //MATT change stream to data
    // pc.onremovestream = handleRemoteStreamRemoved; //MATT change stream to data
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function createDataChannels() {
  dataChannelSend.placeholder = ''; //MATT what happens if remove.
  dataConstraint = null;
  try {
    sendDataChannel = pc.createDataChannel('sendDataChannel',
      dataConstraint);
      console.log('Created send data channel');
    sendDataChannel.onopen = onSendDataChannelStateChange;
    sendDataChannel.onclose = onSendDataChannelStateChange;
    pc.ondatachannel = receiveDataChannelCallback;
    console.log('Created Data Channels');
  } catch (e) {
    console.log('Failed to create Data Channels, exception: ' + e.message);
    alert('Cannot create Data Channels object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Trying to handle remote stream');
  try {
    // event.streams is an array, so we need to get the first stream
    remoteStream = event.streams[0];
    remoteVideo.srcObject = remoteStream;
  } catch (e) {
    console.log('Failed to add remote stream ' + e.message);
    return;
  }
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

// Local and remote stream handling
function addLocalStreamChannel() {
  try {
    console.log('Requesting user media with constraints:', constraints);

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    })
    .then(gotStream)
    .then(doCall)
    .catch(function(e) {
      console.error('getUserMedia() error:', e); // Improved logging
      // alert('getUserMedia() error: ' + e.message + ' (' + e.name + ')'); // Show detailed error message
    });
    // doCall();
  } catch (e) {
    console.log('Failed to create Stream Channels, exception: ' + e.message);
    alert('Cannot create Stream Channels object.');
    return;
  }
}

function addRemoteStreamChannel() {
  console.log('Actually Trying to add remote stream');
  try {
    pc.ontrack = handleRemoteStreamAdded; //MATT change stream to data
    pc.onremovestream = handleRemoteStreamRemoved; //MATT change stream to data
  } catch (e) {
    console.log('Failed to create Stream Channels, exception: ' + e.message);
    alert('Cannot create Stream Channels object.');
    return;
  }
}

function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media');
  if (pc) {
    try {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    } catch (e) {
      console.log('Failed to add tracks to peer connection, exception: ' + e.message);
      alert('Cannot add tracks to peer connection.');
    }
  }
}

// Data channel handling
function sendData() {
  var data = dataChannelSend.value;
  sendDataChannel.send(data);
  console.log('Sent Data: ' + data);
}

function receiveDataChannelCallback(event) {
  console.log('Receive Channel Callback');
  receiveDataChannel = event.channel;
  receiveDataChannel.onmessage = onReceiveMessageCallback;
  receiveDataChannel.onopen = onReceiveDataChannelStateChange;
  receiveDataChannel.onclose = onReceiveDataChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log('Received Message');
  dataChannelReceive.value = event.data;
}

function onSendDataChannelStateChange() {
  var readyState = sendDataChannel.readyState;
  console.log('Send channel state is: ' + readyState);
  if (readyState === 'open') {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    sendDataButton.disabled = false;
    closeButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendDataButton.disabled = true;
    closeButton.disabled = true;
  }
}

function onReceiveDataChannelStateChange() {
  var readyState = receiveDataChannel.readyState;
  console.log('Receive channel state is: ' + readyState);
}

// Session control
function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  // isInitiator = false;
  isStarted = false;
}

function stop() {
  console.log('Trying to stop session');
  isStarted = false;

  // Close the data channels
  if (sendDataChannel) {
    sendDataChannel.close();
    sendDataChannel = null;
  }
  if (receiveDataChannel) {
    receiveDataChannel.close();
    receiveDataChannel = null;
  }
  // Close the peer connection
  if (pc) {
    pc.close();
    pc = null;
  }

  // isInitiator = false;
  // isChannelReady = false;
  // pc.close();
  // pc = null;
  sendMessage('bye');
}

// Cleanup on window unload
window.onbeforeunload = function() {
  sendMessage('bye');
};