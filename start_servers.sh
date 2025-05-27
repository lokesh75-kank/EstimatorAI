#!/bin/bash

# Start backend server
echo "Starting backend server..."
cd estimator_agent
uvicorn api:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend server
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Register the cleanup function for script termination
trap cleanup SIGINT SIGTERM

# Keep the script running
wait 