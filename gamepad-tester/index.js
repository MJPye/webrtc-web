let controllerIndex = null;
var gamepad;

window.addEventListener("gamepadconnected", (event) => {
  const gamepad = event.gamepad;
  controllerIndex = gamepad.index;
  console.log("connected");
});

window.addEventListener("gamepaddisconnected", (event) => {
  controllerIndex = null;
  console.log("disconnected");
});

// function handleButtons(buttons) {
//   for (let i = 0; i < buttons.length; i++) {
//     const button = buttons[i];
//     const buttonElement = document.getElementById(`controller-b${i}`);
//     const selectedButtonClass = "selected-button";

//     if (buttonElement) {
//       if (button.value > 0) {
//         buttonElement.classList.add(selectedButtonClass);
//         buttonElement.style.filter = `contrast(${button.value * 150}%)`;
//         console.log(i)
//       } else {
//         buttonElement.classList.remove(selectedButtonClass);
//         buttonElement.style.filter = `contrast(100%)`;
//       }
//     }
//   }
// }

// function updateStick(elementId, leftRightAxis, upDownAxis) {
//   const multiplier = 25;
//   const stickLeftRight = leftRightAxis * multiplier;
//   const stickUpDown = upDownAxis * multiplier;

//   const stick = document.getElementById(elementId);
//   const x = Number(stick.dataset.originalXPosition);
//   const y = Number(stick.dataset.originalYPosition);

//   stick.setAttribute("cx", x + stickLeftRight);
//   stick.setAttribute("cy", y + stickUpDown);
// }

// function handleSticks(axes) {
//   updateStick("controller-b10", axes[0], axes[1]);
//   updateStick("controller-b11", axes[2], axes[3]);
// }

function gameLoop() {
  if (controllerIndex !== null) {
    gamepad = navigator.getGamepads()[controllerIndex];
    // handleButtons(gamepad.buttons);
    // handleSticks(gamepad.axes);
    // var rosButtonArray;
    // var rosStickArray;
    var { rosButtonArray, rosStickArray } = mapValues(gamepad.buttons, gamepad.axes);
    console.log(rosButtonArray);
    console.log(rosStickArray)
  }
  setTimeout(gameLoop, 100);
}

// Mapping values from Javascript into the ROS2 array for joystick
function mapValues(gamepadArray, stickArray) {
    // Javascript
    const firstArray = [
        'A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 
        'Select (left one)', 'Start (right one)', 
        'left stick click', 'right stick click', 
        'UP', 'DOWN', 'LEFT', 'RIGHT'
      ];
    // ROS2 joystick
    const secondArray = [
        'A', 'B', 'X', 'Y', 'Select (left one)', , 
        'Start (right one)', 'left stick click', 
        'right stick click', 'LB', 
        'RB', 'UP', 'DOWN', 'LEFT', 'RIGHT'
      ];

    // Initialize the result array with default values of 0, length 20 for ROS2
    const rosButtonArray = Array(20).fill(0);
    const rosStickArray = Array(6).fill(0);

    // Mapping of firstArray values to their corresponding indices in secondArray
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
    // Fill the ROS array with the first 4 values from JS gamepad, leave the other 2 spaces as 0.
    for (let i = 0; i < stickArray.length; i++) {
        rosStickArray[i] = stickArray[i];
    }
    //console.log(rosButtonArray);
    return {
        rosButtonArray,
        rosStickArray
    };
}
  
  


gameLoop();