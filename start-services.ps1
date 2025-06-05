# =============================================================================
# 🚀 Script para Iniciar Financial Dashboard - Backend e Frontend
# =============================================================================

Write-Host "🏦 Iniciando Financial Dashboard..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Verificar se estamos no diretório correto
if (-not (Test-Path ".\backend\main.py") -or -not (Test-Path ".\frontend\package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto!" -ForegroundColor Red
    Write-Host "📂 Certifique-se de que existe backend/main.py e frontend/package.json" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Função para verificar se uma porta está em uso
function Test-Port {
    param($Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $false
    }
    catch {
        return $true
    }
}

# Verificar se as portas estão disponíveis
Write-Host "🔍 Verificando portas..." -ForegroundColor Yellow

if (Test-Port 8000) {
    Write-Host "⚠️  Porta 8000 (Backend) já está em uso!" -ForegroundColor Red
    $continue = Read-Host "Deseja continuar mesmo assim? (s/N)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 1
    }
}

if (Test-Port 3000) {
    Write-Host "⚠️  Porta 3000 (Frontend) já está em uso!" -ForegroundColor Red
    $continue = Read-Host "Deseja continuar mesmo assim? (s/N)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 1
    }
}

# Verificar dependências
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow

# Verificar Python
try {
    $pythonVersion = python --version 2>$null
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python não encontrado! Instale Python 3.8+" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js não encontrado! Instale Node.js 16+" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm não encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Cyan

# Iniciar Backend
Write-Host "🐍 Iniciando Backend (FastAPI)..." -ForegroundColor Blue
try {
    $backendCommand = "cd '$PWD\backend'; Write-Host '🐍 Backend FastAPI - Porta 8000' -ForegroundColor Blue; Write-Host '===============================' -ForegroundColor Blue; python main.py"
    $backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $backendCommand -PassThru -WindowStyle Normal
    
    Write-Host "✅ Backend iniciado! PID: $($backendProcess.Id)" -ForegroundColor Green
    Start-Sleep -Seconds 3
}
catch {
    Write-Host "❌ Erro ao iniciar Backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Iniciar Frontend
Write-Host "⚛️  Iniciando Frontend (React)..." -ForegroundColor Blue
try {
    $frontendCommand = "cd '$PWD\frontend'; Write-Host '⚛️ Frontend React - Porta 3000' -ForegroundColor Blue; Write-Host '=============================' -ForegroundColor Blue; npm start"
    $frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $frontendCommand -PassThru -WindowStyle Normal
    
    Write-Host "✅ Frontend iniciado! PID: $($frontendProcess.Id)" -ForegroundColor Green
    Start-Sleep -Seconds 2
}
catch {
    Write-Host "❌ Erro ao iniciar Frontend: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🛑 Encerrando Backend..." -ForegroundColor Yellow
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""
Write-Host "🎉 Ambos os serviços foram iniciados com sucesso!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚡ Aguardando inicialização completa..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Tentar abrir o navegador
Write-Host "🌐 Abrindo navegador..." -ForegroundColor Cyan
try {
    Start-Process "http://localhost:3000"
}
catch {
    Write-Host "⚠️  Não foi possível abrir o navegador automaticamente." -ForegroundColor Yellow
    Write-Host "🔗 Acesse manualmente: http://localhost:3000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Yellow
Write-Host "   • Para parar os serviços: Feche as janelas ou use Ctrl+C em cada uma" -ForegroundColor White
Write-Host "   • Backend PID: $($backendProcess.Id)" -ForegroundColor White
Write-Host "   • Frontend PID: $($frontendProcess.Id)" -ForegroundColor White
Write-Host ""

# Menu de opções
do {
    Write-Host "🎛️  Opções:" -ForegroundColor Cyan
    Write-Host "   [1] Abrir Frontend no navegador" -ForegroundColor White
    Write-Host "   [2] Abrir API Docs no navegador" -ForegroundColor White
    Write-Host "   [3] Verificar status dos serviços" -ForegroundColor White
    Write-Host "   [4] Parar todos os serviços" -ForegroundColor White
    Write-Host "   [5] Sair (manter serviços rodando)" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Escolha uma opção (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host "🌐 Abrindo Frontend..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000"
        }
        "2" {
            Write-Host "📚 Abrindo API Docs..." -ForegroundColor Cyan
            Start-Process "http://localhost:8000/docs"
        }
        "3" {
            Write-Host "🔍 Verificando status..." -ForegroundColor Yellow
            $backendRunning = Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
            $frontendRunning = Get-Process -Id $frontendProcess.Id -ErrorAction SilentlyContinue
            
            if ($backendRunning) {
                Write-Host "✅ Backend está rodando (PID: $($backendProcess.Id))" -ForegroundColor Green
            } else {
                Write-Host "❌ Backend não está rodando" -ForegroundColor Red
            }
            
            if ($frontendRunning) {
                Write-Host "✅ Frontend está rodando (PID: $($frontendProcess.Id))" -ForegroundColor Green
            } else {
                Write-Host "❌ Frontend não está rodando" -ForegroundColor Red
            }
        }
        "4" {
            Write-Host "🛑 Parando serviços..." -ForegroundColor Red
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
            Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Serviços parados!" -ForegroundColor Green
            break
        }
        "5" {
            Write-Host "👋 Saindo... (serviços continuam rodando)" -ForegroundColor Yellow
            break
        }
        default {
            Write-Host "❌ Opção inválida! Tente novamente." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "4" -and $choice -ne "5") {
        Write-Host ""
        Read-Host "Pressione Enter para continuar"
        Clear-Host
        Write-Host "🏦 Financial Dashboard - Serviços Ativos" -ForegroundColor Cyan
        Write-Host "=======================================" -ForegroundColor Cyan
    }
    
} while ($choice -ne "4" -and $choice -ne "5")

Write-Host ""
Write-Host "🎯 Script finalizado!" -ForegroundColor Green 