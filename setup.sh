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
  echo "  build               Build all services (Server, Client)"
  echo "  start               Start all services (MongoDB, Server, Client)"
  echo "  stop                Stop all services"
  echo "  restart             Restart all services"
  echo "  logs                Show logs from all services"
  echo "  server-logs         Show logs from server only"
  echo "  client-logs         Show logs from client only"
  echo "  mongodb-logs        Show logs from MongoDB only"
  echo "  clean               Stop and remove containers, networks, volumes, and images"
  echo "  status              Show status of containers"
  echo "  init                Initial setup (install dependencies for all services)"
  echo "  backup-db           Create a backup of the MongoDB database"
  echo "  restore-db          Restore the MongoDB database from a backup file"
  echo "  import-assessments  Import assessments from a JSON file"
  echo "  help                Show this help message"
  echo ""
}

# Function to install dependencies
init() {
  echo -e "${YELLOW}Installing dependencies for root...${NC}"
  bun install
  
  echo -e "${YELLOW}Installing dependencies for server...${NC}"
  cd server && bun install && cd ..
  
  echo -e "${YELLOW}Installing dependencies for client...${NC}"
  cd client && bun install && cd ..
  
  echo -e "${GREEN}Setup completed successfully!${NC}"
}

# Function to backup MongoDB database
backup_db() {
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_DIR="./backups"
  
  mkdir -p $BACKUP_DIR
  
  echo -e "${YELLOW}Creating MongoDB backup...${NC}"
  docker compose -f docker-compose.yml exec mongodb sh -c 'mongodump --archive' > "$BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backup created successfully: $BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive${NC}"
  else
    echo -e "${RED}Backup failed${NC}"
    exit 1
  fi
}

# Function to restore MongoDB database from a backup
restore_db() {
  if [ -z "$1" ]; then
    echo -e "${YELLOW}Please provide the backup file path to restore from.${NC}"
    echo "Usage: ./setup.sh restore-db <backup-file-path>"
    exit 1
  fi

  BACKUP_FILE=$1

  if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}Backup file not found: $BACKUP_FILE${NC}"
    exit 1
  fi

  echo -e "${YELLOW}Restoring MongoDB from backup: $BACKUP_FILE...${NC}"
  cat "$BACKUP_FILE" | docker compose -f docker-compose.yml exec -T mongodb sh -c 'mongorestore --archive --drop'

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database restored successfully from $BACKUP_FILE${NC}"
  else
    echo -e "${RED}Restore failed${NC}"
    exit 1
  fi
}

# Function to import assessments from a JSON file
# Import Command: bun import-assessment.js sample-assessments/terraform-expert-assessment.json

import_assessments() {
  if [ -z "$1" ]; then
    echo -e "${YELLOW}Please provide the assessment JSON file path to import.${NC}"
    echo "Usage: ./setup.sh import-assessments <assessment-json-file-path>"
    exit 1
  fi

  ASSESSMENT_FILE=$1
  if [ ! -f "$ASSESSMENT_FILE" ]; then
    echo -e "${YELLOW}Assessment file not found: $ASSESSMENT_FILE${NC}"
    exit 1
  fi

  echo -e "${YELLOW}Importing assessments from file: $ASSESSMENT_FILE...${NC}"
  bun import-assessment.js "$ASSESSMENT_FILE"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Assessments imported successfully from $ASSESSMENT_FILE${NC}"
  else
    echo -e "${RED}Import failed${NC}"
    exit 1
  fi
}

# Main script logic
case "$1" in
  build)
    echo -e "${YELLOW}Building all services...${NC}"
    docker bake
    echo -e "${GREEN}All services built successfully!${NC}"
    ;;
  start)
    echo -e "${YELLOW}Starting all services...${NC}"
    docker bake > /dev/null 2>&1
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
  init)
    init
    ;;
  backup-db)
    backup_db
    ;;
  restore-db)
    restore_db $2
    ;;
  import-assessments)
    import_assessments $2
    ;;
  help|*)
    show_help
    ;;
esac