# 📝 Guia dos Scripts PowerShell

## 🚀 Scripts Disponíveis

### 1. `start-services.ps1` - Script Principal (Recomendado)
**Funcionalidades:**
- ✅ Verificação completa de pré-requisitos
- ✅ Verificação de portas disponíveis
- ✅ Verificação de dependências (Python, Node.js, npm)
- 🚀 Inicialização automática de backend e frontend
- 🎛️ Menu interativo para gerenciar serviços
- 🌐 Abertura automática do navegador
- 📊 Monitoramento de status dos serviços

**Como usar:**
```powershell
.\start-services.ps1
```

**Menu do script:**
1. Abrir Frontend no navegador
2. Abrir API Docs no navegador  
3. Verificar status dos serviços
4. Parar todos os serviços
5. Sair (manter serviços rodando)

---

### 2. `start-simple.ps1` - Script Rápido
**Funcionalidades:**
- ⚡ Inicialização rápida sem verificações extras
- 🚀 Inicialização de backend e frontend
- 🌐 Abertura automática do navegador

**Como usar:**
```powershell
.\start-simple.ps1
```

---

### 3. `stop-services.ps1` - Para Serviços
**Funcionalidades:**
- 🛑 Para todos os processos do Financial Dashboard
- 🔍 Busca por processos nas portas 3000 e 8000
- 📊 Verificação final das portas
- 🧹 Opção de limpeza de cache npm

**Como usar:**
```powershell
.\stop-services.ps1
```

## 🔧 Resolução de Problemas

### Erro de Política de Execução
Se aparecer erro sobre ExecutionPolicy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Portas em Uso
Se as portas 3000 ou 8000 estiverem em uso:
1. Use o script `stop-services.ps1` primeiro
2. Ou mate os processos manualmente:
```powershell
# Ver processos usando as portas
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8000"

# Matar processo por PID
taskkill /PID <numero_do_pid> /F
```

### Python/Node.js não encontrado
Certifique-se de que estão instalados e no PATH:
```powershell
# Verificar instalações
python --version
node --version
npm --version
```

### Dependências não instaladas
Para instalar dependências manualmente:
```powershell
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd frontend
npm install
```

## 📋 URLs Importantes

Após executar os scripts, os serviços estarão disponíveis em:

- 🌐 **Frontend (Dashboard)**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000  
- 📚 **API Documentation**: http://localhost:8000/docs
- 🔍 **API Redoc**: http://localhost:8000/redoc

## 💡 Dicas

1. **Primeira execução**: Pode demorar mais devido à instalação de dependências
2. **Janelas separadas**: Cada serviço abre em uma janela PowerShell separada
3. **Auto-reload**: Ambos os serviços detectam mudanças automaticamente
4. **Logs**: Os logs aparecem nas respectivas janelas dos serviços
5. **Parar serviços**: Use Ctrl+C em cada janela ou execute `stop-services.ps1`

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se todas as dependências estão instaladas
2. Execute `stop-services.ps1` para limpar processos anteriores
3. Tente novamente com `start-services.ps1`
4. Verifique os logs nas janelas dos serviços para erros específicos 