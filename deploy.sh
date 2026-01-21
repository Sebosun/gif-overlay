#!/bin/bash

PI_USER="bes"
PI_HOST="raspberrypi.local"                     # IP address or hostname of your Pi
LOCAL_DIR="/home/bes/Code/projects/gif-overlay" # Path to your local folder(trailing slash is important for rsync)
REMOTE_DIR="/home/bes/Code/"                    # Where to put files on the Pi

# -- - Colors for Output-- -
GREEN='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}1: Syncing files to Raspberry Pi...${NC}"
# - a: archive mode(preserves permissions / times)
# - v: verbose
# - z: compress during transfer
# --exclude: skips node_modules and git to save time / bandwidth
rsync -avz --exclude 'node_modules' --progress ${LOCAL_DIR} "${PI_USER}@${PI_HOST}:${REMOTE_DIR}"

echo -e "${GREEN}Syncing files complete!${NC}"
