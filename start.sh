
#!/bin/bash
# Script to start both client and server

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting Booking App ===${NC}"

# Check if the user is in the right directory
if [ ! -d "server" ] || [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the root directory of the booking app${NC}"
    exit 1
fi

# Start the server in the background
echo -e "${YELLOW}Starting server...${NC}"
cd server
npm run dev &
SERVER_PID=$!
cd ..

# Wait for the server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 3

# Start the client
echo -e "${YELLOW}Starting client...${NC}"
npm run dev &
CLIENT_PID=$!

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo -e "${GREEN}Application stopped.${NC}"
    exit 0
}

# Set up trap for cleanup on script termination
trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}Application is running!${NC}"
echo -e "${YELLOW}Server:${NC} http://localhost:3001"
echo -e "${YELLOW}Client:${NC} http://localhost:8080"
echo -e "\nPress Ctrl+C to stop the application"

# Wait for user to press Ctrl+C
wait
