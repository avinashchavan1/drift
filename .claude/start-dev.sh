#!/bin/sh
cd /Users/avinashchavan/claude_projects/tasks/flowlist
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin"
export VITE_API_URL="https://flowlist-api-production.up.railway.app/api"
exec /opt/homebrew/opt/node/bin/node node_modules/.bin/vite --port 5173
