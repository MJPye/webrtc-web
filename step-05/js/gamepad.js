// gamepad.js

let controllerIndex = null;
let gamepad = null;

function setupEventListeners() {
  window.addEventListener("gamepadconnected", (event) => {
    gamepad = event.gamepad;
    controllerIndex = gamepad.index;
    console.log("Gamepad connected:", gamepad);
  });

  window.addEventListener("gamepaddisconnected", (event) => {
    if (gamepad && gamepad.index === event.gamepad.index) {
      controllerIndex = null;
      gamepad = null;
      console.log("Gamepad disconnected:", event.gamepad);
    }
  });
}

function mapValues(gamepadArray, stickArray) {
  const firstArray = [
    'A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 
    'Select (left one)', 'Start (right one)', 
    'left stick click', 'right stick click', 
    'UP', 'DOWN', 'LEFT', 'RIGHT'
  ];

  const secondArray = [
    'A', 'B', 'X', 'Y', 'Select (left one)', 
    'Start (right one)', 'left stick click', 
    'right stick click', 'LB', 'RB', 
    'UP', 'DOWN', 'LEFT', 'RIGHT'
  ];

  const rosButtonArray = Array(20).fill(0);
  const rosStickArray = Array(6).fill(0);

  const mapping = {
    'A': 0,
    'B': 1,
    'X': 2,
    'Y': 3,
    'Select (left one)': 4,
    'Start (right one)': 6,
    'left stick click': 7,
    'right stick click': 8,
    'LB': 9,
    'RB': 10,
    'UP': 11,
    'DOWN': 12,
    'LEFT': 13,
    'RIGHT': 14
  };

  for (let i = 0; i < 16; i++) {
    const buttonName = firstArray[i];
    const mappedIndex = mapping[buttonName];
    if (mappedIndex !== undefined) {
      rosButtonArray[mappedIndex] = gamepadArray[i].value;
    }
  }

  for (let i = 0; i < stickArray.length; i++) {
    rosStickArray[i] = stickArray[i];
  }

  return { rosButtonArray, rosStickArray };
}

function getGamepadValues() {
  if (controllerIndex !== null) {
    gamepad = navigator.getGamepads()[controllerIndex];
    return mapValues(gamepad.buttons, gamepad.axes);
  }
  return { rosButtonArray: [], rosStickArray: [] }; // Return empty arrays if no gamepad is connected
}

// Initialize the event listeners when the module is loaded
setupEventListeners();

// Export the function to be used in main.js
module.exports { getGamepadValues };
