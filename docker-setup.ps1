# Budget Dashboard Docker Setup Script for Windows PowerShell

# Function to display colored output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($message) {
    Write-ColorOutput Blue "ℹ️  $message"
}

function Write-Success($message) {
    Write-ColorOutput Green "✅ $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "⚠️  $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "❌ $message"
}

# Check if Docker is installed
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        $null = Get-Command docker-compose -ErrorAction Stop
        Write-Success "Docker and Docker Compose are installed"
        return $true
    }
    catch {
        Write-Error "Docker or Docker Compose is not installed. Please install Docker Desktop first."
        return $false
    }
}

# Show main menu
function Show-Menu {
    Write-Host ""
    Write-Host "==================================="
    Write-Host "  Budget Dashboard Docker Manager"
    Write-Host "==================================="
    Write-Host "1. Start application (build & run)"
    Write-Host "2. Start application (run only)"
    Write-Host "3. Stop application"
    Write-Host "4. View logs"
    Write-Host "5. Clean up (remove containers & volumes)"
    Write-Host "6. Rebuild from scratch"
    Write-Host "7. Show application status"
    Write-Host "8. Backup database"
    Write-Host "9. Exit"
    Write-Host "==================================="
}

# Start application with build
function Start-WithBuild {
    Write-Info "Building and starting the application..."
    docker-compose up --build -d
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application started successfully!"
        Write-Info "Frontend: http://localhost:3000"
        Write-Info "Backend API: http://localhost:8000"
        Write-Info "API Documentation: http://localhost:8000/docs"
    } else {
        Write-Error "Failed to start application"
    }
}

# Start application without build
function Start-Only {
    Write-Info "Starting the application..."
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application started successfully!"
        Write-Info "Frontend: http://localhost:3000"
        Write-Info "Backend API: http://localhost:8000"
    } else {
        Write-Error "Failed to start application"
    }
}

# Stop application
function Stop-App {
    Write-Info "Stopping the application..."
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application stopped successfully!"
    } else {
        Write-Error "Failed to stop application"
    }
}

# View logs
function Show-Logs {
    Write-Host "1. All services"
    Write-Host "2. Backend only"
    Write-Host "3. Frontend only"
    $logChoice = Read-Host "Choose logs to view (1-3)"
    
    switch ($logChoice) {
        "1" { docker-compose logs -f }
        "2" { docker-compose logs -f backend }
        "3" { docker-compose logs -f frontend }
        default { Write-Error "Invalid choice" }
    }
}

# Clean up
function Invoke-Cleanup {
    Write-Warning "This will remove all containers, networks, and volumes (including database data)!"
    $confirm = Read-Host "Are you sure? (y/N)"
    
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Info "Cleaning up..."
        docker-compose down -v --rmi all
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Cleanup completed!"
        } else {
            Write-Error "Cleanup failed"
        }
    } else {
        Write-Info "Cleanup cancelled"
    }
}

# Rebuild from scratch
function Invoke-Rebuild {
    Write-Info "Rebuilding from scratch..."
    docker-compose down -v
    docker-compose build --no-cache
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Rebuild completed!"
    } else {
        Write-Error "Rebuild failed"
    }
}

# Show status
function Show-Status {
    Write-Info "Application Status:"
    docker-compose ps
    Write-Host ""
    Write-Info "Container Health:"
    
    # Check backend health
    try {
        $backendHealth = docker-compose exec backend curl -f http://localhost:8000/health 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backend: Healthy"
        } else {
            Write-Error "Backend: Unhealthy"
        }
    } catch {
        Write-Error "Backend: Unhealthy"
    }
    
    # Check frontend health
    try {
        $frontendHealth = docker-compose exec frontend wget --no-verbose --tries=1 --spider http://localhost/health 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend: Healthy"
        } else {
            Write-Error "Frontend: Unhealthy"
        }
    } catch {
        Write-Error "Frontend: Unhealthy"
    }
}

# Backup database
function Backup-Database {
    Write-Info "Creating database backup..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.db"
    
    try {
        docker cp budget-backend:/app/data/financial_dashboard.db $backupFile 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database backed up to: $backupFile"
        } else {
            Write-Error "Failed to backup database. Make sure the backend container is running."
        }
    } catch {
        Write-Error "Failed to backup database. Make sure the backend container is running."
    }
}

# Main script
function Main {
    if (!(Test-Docker)) {
        return
    }
    
    while ($true) {
        Show-Menu
        $choice = Read-Host "Choose an option (1-9)"
        
        switch ($choice) {
            "1" { Start-WithBuild }
            "2" { Start-Only }
            "3" { Stop-App }
            "4" { Show-Logs }
            "5" { Invoke-Cleanup }
            "6" { Invoke-Rebuild }
            "7" { Show-Status }
            "8" { Backup-Database }
            "9" { 
                Write-Info "Goodbye!"
                return
            }
            default { Write-Error "Invalid choice. Please try again." }
        }
        
        Write-Host ""
        Read-Host "Press Enter to continue..."
    }
}

# Run main function
Main 

# Search for database files on your computer
Get-ChildItem -Path C:\ -Name "*.db" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_ -like "*financial*" -or $_ -like "*dashboard*" } 