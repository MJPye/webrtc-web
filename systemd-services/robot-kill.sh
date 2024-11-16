#!/bin/bash

screen -ls | awk '{print $1}' | grep -E 'rtsp-server-from-script|rtsp-to-webrtc-from-script|signalling-server-from-script|webrtc-to-ros2-from-script|teleop-twist-joy-from-script' | xargs -I {} screen -S {} -X quit
