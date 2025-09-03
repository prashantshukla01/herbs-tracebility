#!/bin/bash

echo "🌿 Starting AyurTrace - Herb Traceability System"
echo "================================================"

# Kill any existing processes on ports 3000 and 5173
echo "🔄 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be freed
sleep 2

# Start backend in background
echo "🚀 Starting Backend API on port 3000..."
cd /Users/prashantshukla/ayurvedic-herb-traceability
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting Frontend on port 5173..."
cd /Users/prashantshukla/ayurvedic-herb-traceability/frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

echo "✅ Both services are starting up!"
echo ""
echo "📊 Backend API: http://localhost:3000"
echo "🌐 Frontend:    http://localhost:5173"
echo ""
echo "🔥 Open http://localhost:5173 in your browser to see your beautiful green UI!"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    
    # Additional cleanup
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
