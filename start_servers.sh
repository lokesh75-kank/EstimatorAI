#!/bin/bash

# Set environment variables
export NODE_ENV=development

# Store the project root directory
PROJECT_ROOT="$(dirname "$0")"

# Start backend server
echo "Starting backend server..."
cd "$PROJECT_ROOT/backend" && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend server
echo "Starting frontend server..."
cd "$PROJECT_ROOT/frontend" && npm run dev &
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

# Wait for both servers to exit
wait $BACKEND_PID
wait $FRONTEND_PID 