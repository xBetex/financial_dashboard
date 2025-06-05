# =============================================================================
# Script para Verificar e Corrigir Dependencias
# =============================================================================

Write-Host "Verificando dependencias do Financial Dashboard..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Verificar se estamos no diretorio correto
if (-not (Test-Path ".\frontend\package.json") -or -not (Test-Path ".\backend\requirements.txt")) {
    Write-Host "Erro: Execute este script no diretorio raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1. Verificando Frontend..." -ForegroundColor Yellow
Set-Location "frontend"

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules nao encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "node_modules encontrado. Verificando atualizacoes..." -ForegroundColor Green
}

# Verificar problemas com dependencias
Write-Host "Executando npm audit..." -ForegroundColor Yellow
$auditResult = npm audit 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Vulnerabilidades encontradas:" -ForegroundColor Red
    Write-Host $auditResult -ForegroundColor Red
    
    $fix = Read-Host "Deseja tentar corrigir automaticamente? (s/N)"
    if ($fix -eq "s" -or $fix -eq "S") {
        Write-Host "Executando npm audit fix..." -ForegroundColor Yellow
        npm audit fix
    }
} else {
    Write-Host "Nenhuma vulnerabilidade encontrada!" -ForegroundColor Green
}

# Verificar dependencias desatualizadas
Write-Host ""
Write-Host "Verificando dependencias desatualizadas..." -ForegroundColor Yellow
$outdatedResult = npm outdated 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependencias desatualizadas encontradas:" -ForegroundColor Yellow
    Write-Host $outdatedResult -ForegroundColor Yellow
    
    $update = Read-Host "Deseja atualizar dependencias? (s/N)"
    if ($update -eq "s" -or $update -eq "S") {
        Write-Host "Atualizando dependencias..." -ForegroundColor Yellow
        npm update
    }
} else {
    Write-Host "Todas as dependencias estao atualizadas!" -ForegroundColor Green
}

# Testar compilacao
Write-Host ""
Write-Host "Testando compilacao do frontend..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend compila com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Erro na compilacao do frontend:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
}

Set-Location ".."

Write-Host ""
Write-Host "2. Verificando Backend..." -ForegroundColor Yellow
Set-Location "backend"

# Verificar ambiente virtual
if (-not (Test-Path "venv")) {
    Write-Host "Ambiente virtual nao encontrado. Criando..." -ForegroundColor Yellow
    python -m venv venv
}

# Ativar ambiente virtual (apenas mostrar como fazer)
Write-Host "Para ativar o ambiente virtual manualmente, execute:" -ForegroundColor Cyan
Write-Host "  .\venv\Scripts\Activate" -ForegroundColor White

# Verificar se pip freeze funciona
try {
    $installedPackages = pip freeze 2>$null
    Write-Host "Dependencias do Python instaladas:" -ForegroundColor Green
    Write-Host $installedPackages -ForegroundColor White
}
catch {
    Write-Host "Problema ao verificar dependencias do Python" -ForegroundColor Yellow
}

# Verificar requirements.txt
if (Test-Path "requirements.txt") {
    Write-Host ""
    Write-Host "Verificando requirements.txt..." -ForegroundColor Yellow
    $requirements = Get-Content "requirements.txt"
    foreach ($req in $requirements) {
        Write-Host "  $req" -ForegroundColor White
    }
    
    $install = Read-Host "Deseja instalar/atualizar dependencias do backend? (s/N)"
    if ($install -eq "s" -or $install -eq "S") {
        Write-Host "Instalando dependencias do backend..." -ForegroundColor Yellow
        pip install -r requirements.txt --upgrade
    }
}

Set-Location ".."

Write-Host ""
Write-Host "3. Verificacao de Sistema..." -ForegroundColor Yellow

# Verificar versoes
Write-Host "Versoes instaladas:" -ForegroundColor Green
try {
    $pythonVer = python --version 2>&1
    Write-Host "  Python: $pythonVer" -ForegroundColor White
}
catch {
    Write-Host "  Python: NAO ENCONTRADO" -ForegroundColor Red
}

try {
    $nodeVer = node --version 2>&1
    Write-Host "  Node.js: $nodeVer" -ForegroundColor White
}
catch {
    Write-Host "  Node.js: NAO ENCONTRADO" -ForegroundColor Red
}

try {
    $npmVer = npm --version 2>&1
    Write-Host "  npm: v$npmVer" -ForegroundColor White
}
catch {
    Write-Host "  npm: NAO ENCONTRADO" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verificacao completa!" -ForegroundColor Green
Write-Host "Para iniciar o dashboard, execute:" -ForegroundColor Cyan
Write-Host "  .\start-simple.ps1" -ForegroundColor White
Write-Host ""

Read-Host "Pressione Enter para sair" 