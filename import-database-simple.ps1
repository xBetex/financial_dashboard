# Simple Database Import Script with Debug Info

Write-Host "🔍 Starting database import process..." -ForegroundColor Blue

# Ask user for database path
$DatabasePath = Read-Host "Enter the full path to your database file (e.g., C:\path\to\financial_dashboard.db)"

# Check if database file exists
Write-Host "📁 Checking if database file exists..." -ForegroundColor Yellow
if (-not (Test-Path $DatabasePath)) {
    Write-Host "❌ Database file not found: $DatabasePath" -ForegroundColor Red
    Write-Host "📋 Please check the path and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Database file found!" -ForegroundColor Green

# Show file info
$fileInfo = Get-Item $DatabasePath
Write-Host "📊 File info:" -ForegroundColor Cyan
Write-Host "   - Name: $($fileInfo.Name)" -ForegroundColor White
Write-Host "   - Size: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor White
Write-Host "   - Modified: $($fileInfo.LastWriteTime)" -ForegroundColor White

# Create backend data directory
Write-Host "📂 Creating backend data directory..." -ForegroundColor Yellow
$dataDir = "backend\data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "✅ Created directory: $dataDir" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Directory already exists: $dataDir" -ForegroundColor Blue
}

# Copy database file
Write-Host "💾 Copying database file..." -ForegroundColor Yellow
$targetPath = "backend\data\financial_dashboard.db"

try {
    # Remove existing file if it exists
    if (Test-Path $targetPath) {
        Remove-Item $targetPath -Force
        Write-Host "🗑️  Removed existing database file" -ForegroundColor Yellow
    }
    
    Copy-Item $DatabasePath $targetPath -Force
    Write-Host "✅ Database copied successfully!" -ForegroundColor Green
    
    # Verify the copy
    if (Test-Path $targetPath) {
        $copiedFile = Get-Item $targetPath
        Write-Host "✅ Verification: File exists at target location" -ForegroundColor Green
        Write-Host "   - Size: $([math]::Round($copiedFile.Length / 1KB, 2)) KB" -ForegroundColor White
    } else {
        Write-Host "❌ Verification failed: File not found at target location" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Failed to copy database: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is running
Write-Host "🐳 Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerRunning = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker is running" -ForegroundColor Green
        
        # Check if containers are running
        $containers = docker-compose ps -q 2>$null
        if ($containers) {
            Write-Host "🔄 Docker containers are running. Restarting backend..." -ForegroundColor Yellow
            docker-compose restart backend
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Backend restarted successfully!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Failed to restart backend. You may need to restart manually." -ForegroundColor Yellow
            }
        } else {
            Write-Host "ℹ️  No containers running. Start with: docker-compose up --build" -ForegroundColor Blue
        }
    } else {
        Write-Host "⚠️  Docker is not running. Please start Docker Desktop." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check Docker status: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Database import completed!" -ForegroundColor Green
Write-Host "📍 Database location: $targetPath" -ForegroundColor Cyan
Write-Host "🌐 Access your application at:" -ForegroundColor Blue
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   - API Documentation: http://localhost:8000/docs" -ForegroundColor White

Read-Host "Press Enter to exit" 