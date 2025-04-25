#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display help menu
show_help() {
  echo -e "${GREEN}MERN Assessment Platform - Production Deployment Script${NC}"
  echo "Usage: ./deploy-prod.sh [command]"
  echo ""
  echo "Commands:"
  echo "  deploy           Build and deploy the production environment"
  echo "  start            Start all production services"
  echo "  stop             Stop all production services"
  echo "  restart          Restart all production services"
  echo "  logs             Show logs from all production services"
  echo "  status           Show status of production containers"
  echo "  backup-db        Create a backup of the MongoDB database"
  echo "  help             Show this help message"
  echo ""
}

# Function to backup MongoDB database
backup_db() {
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_DIR="./backups"
  
  mkdir -p $BACKUP_DIR
  
  echo -e "${YELLOW}Creating MongoDB backup...${NC}"
  docker compose -f docker-compose.prod.yml exec mongodb sh -c 'mongodump --archive' > "$BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backup created successfully: $BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive${NC}"
  else
    echo -e "${RED}Backup failed${NC}"
    exit 1
  fi
}

# Main script logic
case "$1" in
  deploy)
    echo -e "${YELLOW}Building and deploying production environment...${NC}"
    docker compose -f docker-compose.prod.yml build --no-cache
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml up -d
    echo -e "${GREEN}Production environment deployed!${NC}"
    ;;
  start)
    echo -e "${YELLOW}Starting production services...${NC}"
    docker compose -f docker-compose.prod.yml up -d
    echo -e "${GREEN}Production services started!${NC}"
    ;;
  stop)
    echo -e "${YELLOW}Stopping production services...${NC}"
    docker compose -f docker-compose.prod.yml stop
    echo -e "${GREEN}Production services stopped!${NC}"
    ;;
  restart)
    echo -e "${YELLOW}Restarting production services...${NC}"
    docker compose -f docker-compose.prod.yml restart
    echo -e "${GREEN}Production services restarted!${NC}"
    ;;
  logs)
    echo -e "${YELLOW}Showing logs from production services (Ctrl+C to exit)...${NC}"
    docker compose -f docker-compose.prod.yml logs -f
    ;;
  status)
    echo -e "${YELLOW}Production container status:${NC}"
    docker compose -f docker-compose.prod.yml ps
    ;;
  backup-db)
    backup_db
    ;;
  help|*)
    show_help
    ;;
esac