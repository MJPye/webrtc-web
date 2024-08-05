const io = require('socket.io-client');

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
