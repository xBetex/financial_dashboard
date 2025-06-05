# =============================================================================
# Financial Dashboard - Script Simples
# =============================================================================

Write-Host "Iniciando Financial Dashboard..." -ForegroundColor Green

# Verificar se estamos no diretorio correto
if (-not (Test-Path ".\backend\main.py") -or -not (Test-Path ".\frontend\package.json")) {
    Write-Host "Erro: Execute este script no diretorio raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando Backend..." -ForegroundColor Blue
$backendCommand = "cd '$PWD\backend'; python main.py"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $backendCommand

Write-Host "Iniciando Frontend..." -ForegroundColor Blue  
$frontendCommand = "cd '$PWD\frontend'; npm start"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $frontendCommand

Start-Sleep -Seconds 5
Write-Host "Servicos iniciados!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan

# Abrir navegador
Start-Process "http://localhost:3000"

Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 