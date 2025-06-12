# Import existing database script for Windows PowerShell

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabasePath
)

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

function Write-Error($message) {
    Write-ColorOutput Red "❌ $message"
}

# Check if database file exists
if (-not (Test-Path $DatabasePath)) {
    Write-Error "Database file not found: $DatabasePath"
    exit 1
}

# Create backend data directory if it doesn't exist
$dataDir = "backend\data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Info "Created data directory: $dataDir"
}

# Copy database file
$targetPath = "backend\data\financial_dashboard.db"
try {
    Copy-Item $DatabasePath $targetPath -Force
    Write-Success "Database imported successfully!"
    Write-Info "Database copied to: $targetPath"
    
    # Check if Docker containers are running
    $containers = docker-compose ps -q
    if ($containers) {
        Write-Info "Docker containers are running. Restarting backend to use new database..."
        docker-compose restart backend
        Write-Success "Backend restarted. Your database is now active!"
    } else {
        Write-Info "No Docker containers running. Start the application with:"
        Write-Info "docker-compose up --build"
    }
    
} catch {
    Write-Error "Failed to copy database: $($_.Exception.Message)"
    exit 1
}

Write-Success "Database import completed!"
Write-Info "You can now access your data at:"
Write-Info "- Frontend: http://localhost:3000"
Write-Info "- Backend API: http://localhost:8000" 