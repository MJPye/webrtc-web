// keyboard_controls.js

// export let keyboardControlEnabled = false;

let keyPressCallback = null;  // This will hold the callback function provided by main.js

export function setKeyPressCallback(callback) {
  keyPressCallback = callback;
}

// Function to handle key presses
export function handleKeyDown(event) {
  // if (!keyboardControlEnabled) return;

  switch (event.key) {
    case 'ArrowUp':
      // console.log('Up arrow pressed');
      keyPressCallback({axes: [0.0, -0.2, 0.0, 0.0, 0.0, 0.0], buttons: [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]});
      // Handle moving forward
      break;
    case 'ArrowDown':
      // console.log('Down arrow pressed');
      keyPressCallback({axes: [0.0, 0.1, 0.0, 0.0, 0.0, 0.0], buttons: [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]});
      // Handle moving backward
      break;
    case 'ArrowLeft':
      // console.log('Left arrow pressed');
      keyPressCallback({axes: [0, 0.0, -0.4, 0.0, 0.0, 0.0], buttons: [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]});
      // Handle turning left
      break;
    case 'ArrowRight':
      // console.log('Right arrow pressed');
      keyPressCallback({axes: [0.0, 0.0, 0.4, 0.0, 0.0, 0.0], buttons: [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]});
      // Handle turning right
      break;
    default:
      break;
  }
}

// Function to handle key releases
export function handleKeyUp(event) {
  // if (!keyboardControlEnabled) return;
  switch (event.key) {
    case 'ArrowUp':
      console.log('Up arrow released');
      keyPressCallback({axes: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
      // Handle stopping forward movement
      break;
    case 'ArrowDown':
      console.log('Down arrow released');
      keyPressCallback({axes: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
      // Handle stopping backward movement
      break;
    case 'ArrowLeft':
      console.log('Left arrow released');
      keyPressCallback({axes: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
      // Handle stopping left turn
      break;
    case 'ArrowRight':
      console.log('Right arrow released');
      keyPressCallback({axes: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0], buttons: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
      // Handle stopping right turn
      break;
    default:
      break;
  }
}

export function setupKeyboardEventListeners() {
  // Add event listeners for keydown and keyup
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

export function removeKeyboardEventListeners() {
  // key up all arrow keys
  handleKeyUp({key: "ArrowUp"});
  handleKeyUp({key: "ArrowLeft"});
  handleKeyUp({key: "ArrowRight"});
  handleKeyUp({key: "ArrowDown"});
  // Add event listeners for keydown and keyup
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
}
