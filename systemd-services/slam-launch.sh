#!/bin/bash

# Launch a screen session for each service and run the corresponding command

# 1. scan message throttle
screen -dmS scan-throttle-from-script /bin/bash -i
screen -S scan-throttle-from-script -X stuff "cd /home/rpi/create3_ros2_ws && source install/local_setup.sh && ros2 run topic_tools throttle messages /scan 1.0 /scan_throttled$(echo -ne '\r')"

echo "scan-throttle-from-script screen started"

# 2. base_link to laser frame transform
screen -dmS base-link-lidar-from-script /bin/bash -i
screen -S base-link-lidar-from-script -X stuff "cd /home/rpi/create3_ros2_ws && source install/local_setup.sh && ros2 run tf2_ros static_transform_publisher 0 0 0.2 3.14159 0 0 base_link laser$(echo -ne '\r')"

echo "base-link-lidar-from-script screen started"

# 3. LiDAR launch
screen -dmS lidar-from-script /bin/bash -i
screen -S lidar-from-script -X stuff "cd /home/rpi/create3_ros2_ws && source install/local_setup.sh && ros2 launch sllidar_ros2 sllidar_c1_launch.py$(echo -ne '\r')"

echo "lidar-from-script screen started"

# 4. slam launch
screen -dmS slam-from-script /bin/bash -i
screen -S slam-from-script -X stuff "cd /home/rpi/create3_ros2_ws && source install/local_setup.sh && ros2 launch create3_lidar_slam slam_toolbox_launch.py$(echo -ne '\r')"

echo "slam-from-script screen started"

# Instructions for user
echo "All screens have been started. Use 'screen -ls' to list and 'screen -r <name>' to reattach."
