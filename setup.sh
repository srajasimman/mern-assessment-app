#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display help menu
show_help() {
  echo -e "${GREEN}MERN Assessment Platform - Development Script${NC}"
  echo "Usage: ./setup.sh [command]"
  echo ""
  echo "Commands:"
  echo "  start             Start all services (MongoDB, Server, Client)"
  echo "  stop              Stop all services"
  echo "  restart           Restart all services"
  echo "  logs              Show logs from all services"
  echo "  server-logs       Show logs from server only"
  echo "  client-logs       Show logs from client only"
  echo "  mongodb-logs      Show logs from MongoDB only"
  echo "  clean             Stop and remove containers, networks, volumes, and images"
  echo "  status            Show status of containers"
  echo "  setup             Initial setup (install dependencies for all services)"
  echo "  help              Show this help message"
  echo ""
}

# Function to install dependencies
setup() {
  echo -e "${YELLOW}Installing dependencies for root...${NC}"
  npm install
  
  echo -e "${YELLOW}Installing dependencies for server...${NC}"
  cd server && npm install && cd ..
  
  echo -e "${YELLOW}Installing dependencies for client...${NC}"
  cd client && npm install && cd ..
  
  echo -e "${GREEN}Setup completed successfully!${NC}"
}

# Main script logic
case "$1" in
  start)
    echo -e "${YELLOW}Starting all services...${NC}"
    docker compose up -d
    echo -e "${GREEN}All services started!${NC}"
    echo -e "${GREEN}Client: http://localhost:3000${NC}"
    echo -e "${GREEN}Server API: http://localhost:5000/api${NC}"
    ;;
  stop)
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker compose stop
    echo -e "${GREEN}All services stopped!${NC}"
    ;;
  restart)
    echo -e "${YELLOW}Restarting all services...${NC}"
    docker compose restart
    echo -e "${GREEN}All services restarted!${NC}"
    ;;
  logs)
    echo -e "${YELLOW}Showing logs from all services (Ctrl+C to exit)...${NC}"
    docker compose logs -f
    ;;
  server-logs)
    echo -e "${YELLOW}Showing logs from server (Ctrl+C to exit)...${NC}"
    docker compose logs -f server
    ;;
  client-logs)
    echo -e "${YELLOW}Showing logs from client (Ctrl+C to exit)...${NC}"
    docker compose logs -f client
    ;;
  mongodb-logs)
    echo -e "${YELLOW}Showing logs from MongoDB (Ctrl+C to exit)...${NC}"
    docker compose logs -f mongodb
    ;;
  clean)
    echo -e "${YELLOW}Cleaning up containers, networks, volumes, and images...${NC}"
    docker compose down -v --rmi local
    echo -e "${GREEN}Cleanup completed!${NC}"
    ;;
  status)
    echo -e "${YELLOW}Container status:${NC}"
    docker compose ps
    ;;
  setup)
    setup
    ;;
  help|*)
    show_help
    ;;
esac