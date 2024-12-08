#!/bin/bash

screen -ls | awk '{print $1}' | grep -E 'scan-throttle-from-script|base-link-lidar-from-script|lidar-from-script|slam-from-script' | xargs -I {} screen -S {} -X quit
