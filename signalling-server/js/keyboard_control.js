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
      console.log('Up arrow pressed');
      keyPressCallback({axes: [0.0, 0.1, 0.0, 0.0, 0.0, 0.0], buttons: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
      // Handle moving forward
      break;
    case 'ArrowDown':
      console.log('Down arrow pressed');
      keyPressCallback({axes: [0.0, -0.1, 0.0, 0.0, 0.0, 0.0], buttons: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
      // Handle moving backward
      break;
    case 'ArrowLeft':
      console.log('Left arrow pressed');
      keyPressCallback({axes: [0.1, 0.0, 0.0, 0.0, 0.0, 0.0], buttons: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
      // Handle turning left
      break;
    case 'ArrowRight':
      console.log('Right arrow pressed');
      keyPressCallback({axes: [-0.1, 0.0, 0.0, 0.0, 0.0, 0.0], buttons: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
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





// var gamepad;

// export function setupEventListeners() {
//   window.addEventListener("gamepadconnected", (event) => {
//     console.log("Setting up gamepad event listeners");
//     const gamepad = event.gamepad;
//     controllerIndex = gamepad.index;
//     console.log("Gamepad connected:", gamepad);
//   });

//   window.addEventListener("gamepaddisconnected", (event) => {
//     if (gamepad && gamepad.index === event.gamepad.index) {
//       controllerIndex = null;
//       gamepad = null;
//       console.log("Gamepad disconnected:", event.gamepad);
//     }
//   });
// }

// export function mapValues(gamepadArray, stickArray) {
//   const firstArray = [
//     'A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 
//     'Select (left one)', 'Start (right one)', 
//     'left stick click', 'right stick click', 
//     'UP', 'DOWN', 'LEFT', 'RIGHT'
//   ];

//   const secondArray = [
//     'A', 'B', 'X', 'Y', 'Select (left one)', 
//     'Start (right one)', 'left stick click', 
//     'right stick click', 'LB', 'RB', 
//     'UP', 'DOWN', 'LEFT', 'RIGHT'
//   ];

//   const rosButtonArray = Array(20).fill(0);
//   const rosStickArray = Array(6).fill(0);

//   const mapping = {
//     'A': 0,
//     'B': 1,
//     'X': 2,
//     'Y': 3,
//     'Select (left one)': 4,
//     'Start (right one)': 6,
//     'left stick click': 7,
//     'right stick click': 8,
//     'LB': 9,
//     'RB': 10,
//     'UP': 11,
//     'DOWN': 12,
//     'LEFT': 13,
//     'RIGHT': 14
//   };

//   for (let i = 0; i < 16; i++) {
//     const buttonName = firstArray[i];
//     const mappedIndex = mapping[buttonName];
//     if (mappedIndex !== undefined) {
//       rosButtonArray[mappedIndex] = gamepadArray[i].value;
//     }
//   }

//   for (let i = 0; i < stickArray.length; i++) {
//     rosStickArray[i] = stickArray[i];
//   }

//   return { rosButtonArray, rosStickArray };
// }

// export function getGamepadValues() {
//   if (controllerIndex !== null) {
//     gamepad = navigator.getGamepads()[controllerIndex];
//     return mapValues(gamepad.buttons, gamepad.axes);
//   }
//   return { rosButtonArray: [], rosStickArray: [] }; // Return empty arrays if no gamepad is connected
// }

// Initialize the event listeners when the module is loaded
// setupEventListeners();

// Export the function to be used in main.js
// module.exports = { getGamepadValues };
