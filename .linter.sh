#!/bin/bash
cd /home/kavia/workspace/code-generation/electromonitor-12508-12515/main_container_for_electromonitor
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

