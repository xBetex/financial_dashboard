#!/bin/bash

# Budget Dashboard Docker Setup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Main menu
show_menu() {
    echo ""
    echo "==================================="
    echo "  Budget Dashboard Docker Manager"
    echo "==================================="
    echo "1. Start application (build & run)"
    echo "2. Start application (run only)"
    echo "3. Stop application"
    echo "4. View logs"
    echo "5. Clean up (remove containers & volumes)"
    echo "6. Rebuild from scratch"
    echo "7. Show application status"
    echo "8. Backup database"
    echo "9. Exit"
    echo "==================================="
}

# Start application with build
start_with_build() {
    print_info "Building and starting the application..."
    docker-compose up --build -d
    print_success "Application started successfully!"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend API: http://localhost:8000"
    print_info "API Documentation: http://localhost:8000/docs"
}

# Start application without build
start_only() {
    print_info "Starting the application..."
    docker-compose up -d
    print_success "Application started successfully!"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend API: http://localhost:8000"
}

# Stop application
stop_app() {
    print_info "Stopping the application..."
    docker-compose down
    print_success "Application stopped successfully!"
}

# View logs
view_logs() {
    echo "1. All services"
    echo "2. Backend only"
    echo "3. Frontend only"
    read -p "Choose logs to view (1-3): " log_choice
    
    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f backend ;;
        3) docker-compose logs -f frontend ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Clean up
cleanup() {
    print_warning "This will remove all containers, networks, and volumes (including database data)!"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v --rmi all
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Rebuild from scratch
rebuild() {
    print_info "Rebuilding from scratch..."
    docker-compose down -v
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Rebuild completed!"
}

# Show status
show_status() {
    print_info "Application Status:"
    docker-compose ps
    echo ""
    print_info "Container Health:"
    docker-compose exec backend curl -f http://localhost:8000/health 2>/dev/null && print_success "Backend: Healthy" || print_error "Backend: Unhealthy"
    docker-compose exec frontend wget --no-verbose --tries=1 --spider http://localhost/health 2>/dev/null && print_success "Frontend: Healthy" || print_error "Frontend: Unhealthy"
}

# Backup database
backup_database() {
    print_info "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker cp budget-backend:/app/data/financial_dashboard.db ./backup_${timestamp}.db 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Database backed up to: backup_${timestamp}.db"
    else
        print_error "Failed to backup database. Make sure the backend container is running."
    fi
}

# Main script
main() {
    check_docker
    
    while true; do
        show_menu
        read -p "Choose an option (1-9): " choice
        
        case $choice in
            1) start_with_build ;;
            2) start_only ;;
            3) stop_app ;;
            4) view_logs ;;
            5) cleanup ;;
            6) rebuild ;;
            7) show_status ;;
            8) backup_database ;;
            9) print_info "Goodbye!"; exit 0 ;;
            *) print_error "Invalid choice. Please try again." ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main 