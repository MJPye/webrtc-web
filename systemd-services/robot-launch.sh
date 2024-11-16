#!/bin/bash

# Launch a screen session for each service and run the corresponding command

# 1. rtsp-server
screen -dmS rtsp-server-from-script /bin/bash -i
screen -S rtsp-server-from-script -X stuff "cd /home/rpi/webcam_testing && python3 test-low-bw-rtsp-server.py$(echo -ne '\r')"

echo "rtsp-server-from-script screen started"

# 2. rtsp-to-webrtc
screen -dmS rtsp-to-webrtc-from-script /bin/bash -i
screen -S rtsp-to-webrtc-from-script -X stuff "cd /home/rpi/webcam_testing/RTSPtoWeb && GO111MODULE=on go run *.go$(echo -ne '\r')"

echo "rtsp-to-webrtc-from-script screen started"

# 3. signalling-server
screen -dmS signalling-server-from-script /bin/bash -i
screen -S signalling-server-from-script -X stuff "cd /home/rpi/webcam_testing/signalling-server && node index.js$(echo -ne '\r')"

echo "signalling-server-from-script screen started"

# 4. webrtc-to-ros2
screen -dmS webrtc-to-ros2-from-script /bin/bash -i
screen -S webrtc-to-ros2-from-script -X stuff "cd /home/rpi/webrtc-to-ros2 && node index.js$(echo -ne '\r')"

echo "webrtc-to-ros2-from-script screen started"

# 5. teleop-twist-joy
screen -dmS teleop-twist-joy-from-script /bin/bash -i
screen -S teleop-twist-joy-from-script -X stuff "cd /home/rpi && ros2 launch teleop_twist_joy teleop-launch.py joy_config:='matthew'$(echo -ne '\r')"

echo "teleop-twist-joy-from-script screen started"

# Instructions for user
echo "All screens have been started. Use 'screen -ls' to list and 'screen -r <name>' to reattach."
