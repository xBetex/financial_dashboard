# =============================================================================
# 🛑 Script para Parar Financial Dashboard - Backend e Frontend
# =============================================================================

Write-Host "🛑 Parando Financial Dashboard..." -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Função para matar processos por porta
function Stop-ProcessByPort {
    param($Port, $ServiceName)
    
    try {
        $connections = netstat -ano | Select-String ":$Port\s"
        
        if ($connections) {
            foreach ($connection in $connections) {
                $parts = $connection.ToString().Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
                $pid = $parts[-1]
                
                if ($pid -match '^\d+$') {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "🔴 Parando $ServiceName (PID: $pid)..." -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "✅ $ServiceName parado!" -ForegroundColor Green
                    }
                }
            }
        } else {
            Write-Host "ℹ️  $ServiceName não está rodando na porta $Port" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "⚠️  Erro ao parar $ServiceName : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Parar processos por nome também
function Stop-ProcessByName {
    param($ProcessName, $ServiceName)
    
    try {
        $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        
        if ($processes) {
            foreach ($process in $processes) {
                # Verificar se é relacionado ao nosso projeto
                if ($process.Path -like "*python*" -or $process.CommandLine -like "*main.py*" -or 
                    $process.CommandLine -like "*npm*start*" -or $process.CommandLine -like "*react-scripts*") {
                    
                    Write-Host "🔴 Parando $ServiceName (PID: $($process.Id))..." -ForegroundColor Yellow
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ $ServiceName parado!" -ForegroundColor Green
                }
            }
        }
    }
    catch {
        Write-Host "⚠️  Erro ao parar processos $ProcessName : $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "🔍 Procurando serviços ativos..." -ForegroundColor Yellow

# Parar Backend (porta 8000)
Stop-ProcessByPort -Port 8000 -ServiceName "Backend (FastAPI)"

# Parar Frontend (porta 3000) 
Stop-ProcessByPort -Port 3000 -ServiceName "Frontend (React)"

# Parar processos Python relacionados
Stop-ProcessByName -ProcessName "python" -ServiceName "Python (Backend)"

# Parar processos Node relacionados ao projeto
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($process in $nodeProcesses) {
        try {
            # Verificar se é um processo do React
            $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($process.Id)").CommandLine
            if ($commandLine -like "*react-scripts*" -or $commandLine -like "*start*") {
                Write-Host "🔴 Parando Frontend Node.js (PID: $($process.Id))..." -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Frontend Node.js parado!" -ForegroundColor Green
            }
        }
        catch {
            # Ignore errors when checking command line
        }
    }
}

Write-Host ""
Write-Host "🔍 Verificando se as portas estão livres..." -ForegroundColor Yellow

# Verificar porta 8000
$port8000 = netstat -ano | Select-String ":8000\s"
if (-not $port8000) {
    Write-Host "✅ Porta 8000 (Backend) está livre" -ForegroundColor Green
} else {
    Write-Host "⚠️  Porta 8000 ainda está em uso" -ForegroundColor Yellow
}

# Verificar porta 3000  
$port3000 = netstat -ano | Select-String ":3000\s"
if (-not $port3000) {
    Write-Host "✅ Porta 3000 (Frontend) está livre" -ForegroundColor Green
} else {
    Write-Host "⚠️  Porta 3000 ainda está em uso" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Processo de parada concluído!" -ForegroundColor Green
Write-Host ""

# Opção para limpar cache se necessário
$clearCache = Read-Host "Deseja limpar cache do npm? (s/N)"
if ($clearCache -eq "s" -or $clearCache -eq "S") {
    Write-Host "🧹 Limpando cache do npm..." -ForegroundColor Yellow
    Set-Location "frontend"
    npm cache clean --force
    Set-Location ".."
    Write-Host "✅ Cache limpo!" -ForegroundColor Green
}

Read-Host "Pressione Enter para sair" 