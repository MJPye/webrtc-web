#!/bin/bash

# Function to send Ctrl+C to a specific screen session
send_ctrl_c_and_quit() {
    screen_name=$1

    # Check if the screen session exists
    if screen -list | grep -q "$screen_name"; then
        echo "Connecting to the screen session: $screen_name"

        # Send Ctrl+C to the target screen
        screen -S "$screen_name" -X stuff $'\003'
        echo "Sent Ctrl+C to $screen_name."

        # Wait for 5 seconds
        sleep 5

        # Quit the screen session
        screen -S "$screen_name" -X quit
        echo "$screen_name session quit successfully."
    else
        echo "Screen session $screen_name does not exist."
    fi
}

# Handle the specific screen "lidar-from-script"
send_ctrl_c_and_quit "lidar-from-script"

# Kill other specified screens
screen -ls | awk '{print $1}' | grep -E 'scan-throttle-from-script|base-link-lidar-from-script|lidar-from-script|slam-from-script' | xargs -I {} screen -S {} -X quit
