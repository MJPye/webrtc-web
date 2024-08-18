const io = require('socket.io-client');
const rclnodejs = require('rclnodejs');
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc');
var data_pc;

// Connect to the signaling server
const socket = io.connect('http://localhost:8020');

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
  } else if (message === 'bye') {
    handleRemoteHangup();
  } else {
    console.log('Client received non-answer data message:', message);
  } 
});

// Send and receive messages through the socket
function sendMessageData(message) {
  console.log('Client sending message: ', message);
  socket.emit('data-request', message);
}

function handleRemoteHangup(){
  console.log('Session terminated.');
  if (data_pc){
    data_pc.close();
    data_pc = null;
  }
  start();
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

function start(){
  createDataPeerConnection()
  .then(() => {
    console.log('PeerConnection created, now creating data channels');
    createDataChannels();
  })
  .catch((error) => {
    console.error('Error creating peer connection or data channels:', error);
  });
}

start();

rclnodejs.init().then(() => {
  const node = rclnodejs.createNode('publisher_example_node');
  const publisher = node.createPublisher('std_msgs/msg/String', 'ya_boi_matt');

  let counter = 0;
  setInterval(() => {
    console.log(`Publishing message: Hello ROS ${counter}`);
    publisher.publish(`Hello ROS ${counter++}`);
  }, 1000);

  rclnodejs.spin(node);
});