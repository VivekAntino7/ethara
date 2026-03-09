#!/bin/bash

# HRMS Lite - Unified Start Script

# Kill background processes on exit
trap "kill 0" EXIT

echo "🚀 Starting HRMS Lite..."

# Start Backend
echo "📡 Starting Backend API on port 8000..."
cd "$(dirname "$0")/backend"
python3 -m uvicorn main:app --port 8000 --reload &

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "💻 Starting Frontend Dev Server on port 5173..."
cd "../frontend"
npm run dev &

# Wait for all processes
wait
