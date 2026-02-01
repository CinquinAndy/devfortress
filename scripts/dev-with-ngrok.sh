#!/usr/bin/env bash

# Script to run server + ngrok for ChatGPT testing
# Don't use set -e because pkill can fail if no processes are found

PORT=${PORT:-3001}
NGROK_PORT=${NGROK_PORT:-$PORT}

echo "🚀 Starting ODCAF MCP Server with ngrok..."
echo ""

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "bun.*dev" 2>/dev/null || true
pkill -f "ngrok.*http" 2>/dev/null || true
sleep 1

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo "   Install it from: https://ngrok.com/download"
    exit 1
fi

# Check if port is available
if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Port $PORT is already in use!"
        echo "   Trying to kill the process..."
        lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Start ngrok first (so we can get the URL before starting server)
echo "🌐 Starting ngrok tunnel..."
ngrok http $NGROK_PORT > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
NGROK_URL=""
for i in {1..5}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"[^"]*' | head -1 | cut -d'"' -f4 || echo "")
    if [ -n "$NGROK_URL" ]; then
        echo "✅ Ngrok tunnel: $NGROK_URL"
        break
    fi
    sleep 1
done

if [ -z "$NGROK_URL" ]; then
    echo "⚠️  Could not get ngrok URL automatically"
    echo "   Check http://localhost:4040 for the ngrok dashboard"
    echo "   Server will start without PUBLIC_URL"
fi

# Start server in background with PUBLIC_URL
echo "📦 Starting server on port $PORT..."
if [ -n "$NGROK_URL" ]; then
    PORT=$PORT PUBLIC_URL=$NGROK_URL bun run dev > /tmp/odcaf-server.log 2>&1 &
else
    PORT=$PORT bun run dev > /tmp/odcaf-server.log 2>&1 &
fi
SERVER_PID=$!

# Disown the processes so they continue even if the script is interrupted
disown $SERVER_PID 2>/dev/null || true
disown $NGROK_PID 2>/dev/null || true

# Wait for server to start
echo "⏳ Waiting for server to start..."
SERVER_READY=false
for i in {1..10}; do
    if curl -s http://localhost:$PORT/health > /dev/null 2>&1; then
        echo "✅ Server is running!"
        SERVER_READY=true
        break
    fi
    sleep 1
done

if [ "$SERVER_READY" != "true" ]; then
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
    exit 1
fi

# Display info
echo ""
echo "============================================================"
echo "  ✅ Server + ngrok are running!"
echo "============================================================"
echo ""
echo "  📍 Local URL:  http://localhost:$PORT"
if [ -n "$NGROK_URL" ]; then
    echo "  🌐 Public URL: $NGROK_URL"
    echo ""
    echo "  🔗 Use this URL in ChatGPT MCP settings:"
    echo "     $NGROK_URL/sse"
else
    echo "  🌐 Public URL: Check http://localhost:4040"
fi
echo ""
echo "  📊 Server logs: tail -f /tmp/odcaf-server.log"
echo "  📊 Ngrok logs:  tail -f /tmp/ngrok.log"
echo "  📊 Ngrok UI:    http://localhost:4040"
echo ""
echo "  Press Ctrl+C to stop both processes"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $SERVER_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
    pkill -f "bun.*dev" 2>/dev/null || true
    pkill -f "ngrok.*http" 2>/dev/null || true
    echo "✅ Cleaned up"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes (this keeps the script running)
# Use wait to keep the script alive until processes exit
# Redirect stderr to avoid "No child processes" errors
wait $SERVER_PID $NGROK_PID 2>/dev/null || {
    # If wait fails, use a polling loop
    while true; do
        # Check if both processes are still alive
        SERVER_ALIVE=false
        NGROK_ALIVE=false
        
        if kill -0 $SERVER_PID 2>/dev/null; then
            SERVER_ALIVE=true
        fi
        
        if kill -0 $NGROK_PID 2>/dev/null; then
            NGROK_ALIVE=true
        fi
        
        # If both are dead, exit
        if [ "$SERVER_ALIVE" != "true" ] && [ "$NGROK_ALIVE" != "true" ]; then
            echo "⚠️  Both processes have exited"
            cleanup
            exit 0
        fi
        
        sleep 2
    done
}
