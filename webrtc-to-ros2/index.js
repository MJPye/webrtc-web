const io = require('socket.io-client');
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc');

// Connect to the signaling server
const socket = io.connect('http://localhost:8040');

// Log connection status
socket.on('connect', () => {
  console.log('Connected to the signaling server');
  
  // Join the "foo" room after connecting
  socket.emit('create or join', 'foo');
});

// Log disconnection status
socket.on('disconnect', () => {
  console.log('Disconnected from the signaling server');
});

// Log any message received
socket.on('message', (message) => {
  console.log('Received message:', message);
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Socket message handling
socket.on('data-request', function (message) {
  console.log('Client received message:', message);
  if (message.type === 'offer' ) {
    data_pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'candidate') {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
      sdpMid: message.id
    });
    data_pc.addIceCandidate(candidate);
  } else {
    console.log('Client received non-answer data message:', message);
  } 
});

// Send and receive messages through the socket
function sendMessageData(message) {
  console.log('Client sending message: ', message);
  socket.emit('data-request', message);
}

// function createDataPeerConnection() {
//   try {
//     data_pc = new RTCPeerConnection({
//       iceServers: [{
//         urls: ['stun:stun.l.google.com:19302']
//       }],
//       sdpSemantics: 'unified-plan'
//     })
//     data_pc.onicecandidate = handleIceCandidate;
//     // createDataChannels();
//     console.log('Created Data RTCPeerConnnection');
//   } catch (e) {
//     console.log('Failed to create Data PeerConnection, exception: ' + e.message);
//     // alert('Cannot create Data RTCPeerConnection object.');
//     return;
//   }
// }

function createDataPeerConnection() {
  return new Promise((resolve, reject) => {
    try {
      data_pc = new RTCPeerConnection({
        iceServers: [{
          urls: ['stun:stun.l.google.com:19302']
        }],
        sdpSemantics: 'unified-plan'
      });

      data_pc.onicecandidate = handleIceCandidate;

      // If you want to wait for ICE gathering to finish, uncomment the following lines
      // data_pc.onicegatheringstatechange = () => {
      //   if (data_pc.iceGatheringState === 'complete') {
      //     console.log('ICE gathering complete');
      //     resolve();  // Resolve the promise
      //   }
      // };

      console.log('Created Data RTCPeerConnection');

      // Resolve the promise immediately if you don't need to wait for ICE gathering
      resolve(); 

    } catch (e) {
      console.log('Failed to create Data PeerConnection, exception: ' + e.message);
      reject(e);  // Reject the promise if an error occurs
    }
  });
}

function createDataChannels() {
  // dataChannelSend.placeholder = ''; //MATT what happens if remove.
  // let dataConstraint = null;
  let dataConstraint = {};
  try {
    sendDataChannel = data_pc.createDataChannel('sendDataChannel',
      dataConstraint);
      console.log('Created send data channel');
    // sendDataChannel.onopen = onSendDataChannelStateChange;
    // sendDataChannel.onclose = onSendDataChannelStateChange;
    data_pc.ondatachannel = receiveDataChannelCallback;
    console.log('Created Data Channels');
  } catch (e) {
    console.log('Failed to create Data Channels, exception: ' + e.message);
    // alert('Cannot create Data Channels object.');
    return;
  }
}

function receiveDataChannelCallback(event) {
  console.log('Receive Channel Callback');
  receiveDataChannel = event.channel;
  receiveDataChannel.onmessage = onReceiveMessageCallback;
  receiveDataChannel.onopen = onReceiveDataChannelStateChange;
  receiveDataChannel.onclose = onReceiveDataChannelStateChange;
}

function onReceiveDataChannelStateChange() {
  var readyState = receiveDataChannel.readyState;
  console.log('Receive channel state is: ' + readyState);
}

function onReceiveMessageCallback(event) {
  console.log('Received Message: ', event.data);
  // dataChannelReceive.value = event.data;
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessageData({
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

function doDataCall() {
  console.log('Sending offer to peer');
  data_pc.createOffer(setLocalAndSendMessageData, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  data_pc.createAnswer().then(
    setLocalAndSendMessageData,
    onCreateSessionDescriptionError
  );
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function setLocalAndSendMessageData(sessionDescription) {
  data_pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessageData sending message', sessionDescription);
  sendMessageData(sessionDescription);
}

// createDataPeerConnection();
// createDataChannels();

createDataPeerConnection()
  .then(() => {
    console.log('PeerConnection created, now creating data channels');
    createDataChannels();
  })
  .catch((error) => {
    console.error('Error creating peer connection or data channels:', error);
  });