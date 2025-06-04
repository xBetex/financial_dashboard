# 🚀 Como Executar o Dashboard Financeiro

## ⚠️ Importante: Ordem de Execução

Para o dashboard funcionar corretamente, você deve executar **PRIMEIRO** o backend, **DEPOIS** o frontend.

## 📋 Pré-requisitos

- Python 3.8+ instalado
- Node.js 14+ instalado  
- npm instalado

## 🔧 Passo a Passo

### 1. **Executar o Backend (PRIMEIRO)**

Abra um terminal/PowerShell e execute:

```powershell
# Navegar para o diretório backend
cd backend

# Instalar dependências Python (primeira vez)
pip install -r requirements.txt

# Executar o servidor backend
python main.py
```

✅ **Aguarde ver a mensagem**: "✅ Default accounts created successfully!"

### 2. **Executar o Frontend (SEGUNDO)**

Abra um **NOVO** terminal/PowerShell e execute:

```powershell
# Navegar para o diretório frontend
cd frontend

# Instalar dependências npm (primeira vez)
npm install

# Executar o servidor frontend
npm start
```

✅ **Aguarde**: O navegador abrirá automaticamente em http://localhost:3000

## 🌐 URLs dos Serviços

- **Dashboard**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## 🔍 Verificando se Está Funcionando

### Estatísticas Avançadas
1. Clique na aba "**Estatísticas Avançadas**"
2. Se aparecer erro, verifique se o backend está rodando
3. Use o botão de **refresh** (🔄) para recarregar

### Filtros por Valor
1. No Dashboard Principal ou Estatísticas Avançadas
2. Clique no ícone de filtro (🔍)
3. Use os campos "**Valor Mínimo**" e "**Valor Máximo**"
4. Exemplo: Min: 100, Max: 1000 (mostra apenas transações entre R$ 100 e R$ 1000)

## 🛠️ Resolução de Problemas

### ❌ "Erro ao carregar estatísticas"
**Solução**: O backend não está rodando
```powershell
cd backend
python main.py
```

### ❌ "Could not read package.json"
**Solução**: Você está no diretório errado
```powershell
cd frontend
npm start
```

### ❌ "ENOENT" ou "no such file"
**Solução**: Navegue para o diretório correto primeiro
```powershell
# Ir para a raiz do projeto
cd D:\python_projects\good_projects\react\Dineu\financial_dashboard-main

# Depois seguir os passos acima
```

### ❌ "Token '&&' is not a valid statement"
**Solução**: Use `;` no PowerShell ao invés de `&&`
```powershell
# ❌ Errado
cd backend && python main.py

# ✅ Correto  
cd backend; python main.py
```

## 🎯 Novas Funcionalidades

### 📊 **Estatísticas Avançadas**
- Gráficos de pizza por categoria
- Evolução mensal de receitas/despesas
- Métricas de performance financeira
- **Filtros por valor**: Min/Max amounts
- **Filtros por tipo**: Apenas receitas ou despesas

### 🎯 **Metas Financeiras**
- Criar metas com prazos
- Acompanhar progresso visual
- Categorias coloridas
- Alertas de prazo

### 🌙 **Dark Mode**
- Toggle no header (🌙/☀️)
- Salva preferência automaticamente

## 💡 Dicas de Uso

1. **Always start backend first** - O frontend precisa da API
2. **Use os filtros** - Combine filtros para análises específicas  
3. **Explore as abas** - Cada aba tem funcionalidades únicas
4. **Dark mode** - Clique no ícone sol/lua para alternar tema

## 🆘 Ainda com Problemas?

Se as estatísticas avançadas ainda não funcionarem:

1. Verifique se o backend responde: http://localhost:8000/health
2. Verifique se há transações no banco: http://localhost:8000/transactions/
3. Abra o Console do navegador (F12) e veja os erros
4. Recarregue a página (Ctrl+F5)

---

💰 **Agora você tem um dashboard financeiro completo e moderno!** 🎉 