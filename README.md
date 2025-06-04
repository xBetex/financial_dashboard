# 💰 Financial Dashboard

Um dashboard financeiro pessoal moderno e completo, desenvolvido com React (frontend) e Python FastAPI (backend).

## 🚀 Características

### 📊 Funcionalidades Principais
- **Lista de Transações**: Visualização organizada por mês com filtros avançados
- **Formulário de Transação**: Interface intuitiva para adicionar entradas e saídas
- **Indicadores de Conta**: Cards visuais mostrando saldo atual de cada conta
- **Gráficos Interativos**: Evolução do saldo ao longo do tempo
- **Filtros Avançados**: Por período, tipo, categoria e conta
- **3 Contas Personalizáveis**: Conta Corrente, Poupança e Carteira (padrão)

### 🎨 Interface
- **Material-UI**: Design moderno e responsivo
- **Tema Customizado**: Cores e componentes otimizados
- **Mobile-First**: Totalmente responsivo para todos os dispositivos
- **Animações Suaves**: Transições e hover effects

### 🔧 Tecnologias
- **Frontend**: React 18, Material-UI, MUI X Charts, date-fns
- **Backend**: Python FastAPI, SQLAlchemy, SQLite
- **API**: REST com documentação automática (Swagger)

## 📁 Estrutura do Projeto

```
financial_dashboard/
├── backend/                 # API Python FastAPI
│   ├── models/             # Modelos do banco de dados
│   │   ├── account.py      # Modelo de conta
│   │   └── transaction.py  # Modelo de transação
│   ├── routers/            # Rotas da API
│   │   ├── accounts.py     # Endpoints de contas
│   │   └── transactions.py # Endpoints de transações
│   ├── database.py         # Configuração do banco
│   ├── main.py            # Aplicação principal
│   └── requirements.txt    # Dependências Python
├── frontend/               # Aplicação React
│   ├── public/            # Arquivos públicos
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── TransactionList.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── AccountIndicator.jsx
│   │   │   ├── BalanceChart.jsx
│   │   │   └── Filters.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json       # Dependências Node.js
├── start.sh              # Script de inicialização
└── README.md            # Este arquivo
```

## 🛠️ Pré-requisitos

### Linux Mint / Ubuntu
```bash
# Instalar Python 3 e pip
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Instalar Node.js e npm
sudo apt install nodejs npm

# Verificar instalações
python3 --version  # Python 3.8+
node --version     # Node 14+
npm --version      # npm 6+
```

### Outras Distribuições
- **Fedora**: `sudo dnf install python3 python3-pip nodejs npm`
- **Arch**: `sudo pacman -S python python-pip nodejs npm`
- **CentOS/RHEL**: `sudo yum install python3 python3-pip nodejs npm`

## 🚀 Instalação e Execução

### Método Rápido (Recomendado)
```bash
# Clone ou baixe o projeto
cd financial_dashboard

# Torne o script executável
chmod +x start.sh

# Execute o dashboard
./start.sh
```

O script `start.sh` irá:
1. ✅ Verificar todos os pré-requisitos
2. 📦 Instalar dependências automaticamente (primeira execução)
3. 🐍 Iniciar o backend Python
4. ⚛️ Iniciar o frontend React
5. 🌐 Abrir automaticamente no navegador

### Método Manual

#### Backend
```bash
cd backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python main.py
```

#### Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Executar aplicação
npm start
```

## 🌐 Acesso

Após a execução, acesse:

- **📊 Dashboard**: http://localhost:3000
- **🔧 API Backend**: http://localhost:8000
- **📚 Documentação da API**: http://localhost:8000/docs
- **🔍 API Redoc**: http://localhost:8000/redoc

## 📖 Como Usar

### 1. Primeira Execução
- O sistema criará automaticamente 3 contas padrão:
  - Conta Corrente (saldo: R$ 0,00)
  - Conta Poupança (saldo: R$ 0,00)
  - Carteira (saldo: R$ 0,00)

### 2. Adicionando Transações
1. Clique no botão **+** (canto inferior direito)
2. Preencha o formulário:
   - **Data**: Data da transação
   - **Tipo**: Entrada ou Saída
   - **Descrição**: Descrição da transação
   - **Categoria**: Selecione uma categoria
   - **Conta**: Escolha a conta
   - **Valor**: Valor em reais
3. Clique em **Salvar**

### 3. Visualizando Dados
- **Cards de Conta**: Mostram saldo atual e status
- **Gráfico**: Evolução do saldo nos últimos 30 dias
- **Lista de Transações**: Organizadas por mês, mais recentes primeiro

### 4. Usando Filtros
- **Mês/Ano**: Filtrar por período específico
- **Tipo**: Apenas entradas ou saídas
- **Categoria**: Filtrar por categoria
- **Conta**: Transações de uma conta específica

## 🎯 Categorias Disponíveis

- 🍽️ Alimentação
- 🚗 Transporte
- 🏠 Moradia
- 🏥 Saúde
- 📚 Educação
- 🎬 Entretenimento
- 👕 Vestuário
- 💰 Salário
- 💼 Freelance
- 📈 Investimentos
- 📦 Outros

## 🔧 API Endpoints

### Transações
- `GET /transactions/` - Listar transações (com filtros)
- `POST /transactions/` - Criar nova transação
- `GET /transactions/monthly` - Resumo mensal

### Contas
- `GET /accounts/` - Listar todas as contas
- `POST /accounts/` - Criar nova conta
- `GET /accounts/balance` - Saldo de todas as contas
- `GET /accounts/{id}/balance-history` - Histórico de saldo
- `PUT /accounts/{id}` - Atualizar conta

## 🗄️ Banco de Dados

O sistema usa SQLite com as seguintes tabelas:

### Accounts (Contas)
- `id`: ID único
- `name`: Nome da conta
- `balance`: Saldo atual

### Transactions (Transações)
- `id`: ID único
- `date`: Data da transação
- `description`: Descrição
- `transaction_type`: "entrada" ou "saida"
- `category`: Categoria
- `amount`: Valor
- `account_id`: ID da conta (FK)

## 🛑 Parando o Sistema

Para parar todos os serviços:
```bash
# Se usando start.sh
Ctrl + C

# Ou manualmente
pkill -f "python main.py"
pkill -f "npm start"
```

## 🔧 Desenvolvimento

### Estrutura de Componentes React
- **Dashboard**: Página principal
- **TransactionList**: Lista de transações por mês
- **TransactionForm**: Formulário para nova transação
- **AccountIndicator**: Card de indicador de conta
- **BalanceChart**: Gráfico de evolução do saldo
- **Filters**: Componente de filtros

### Hooks Utilizados
- `useState`: Gerenciamento de estado local
- `useEffect`: Efeitos colaterais e carregamento de dados
- `useTheme`: Acesso ao tema Material-UI
- `useMediaQuery`: Responsividade

## 🐛 Solução de Problemas

### Erro: "Command not found"
```bash
# Instalar dependências faltantes
sudo apt install python3 python3-pip nodejs npm
```

### Erro: "Permission denied"
```bash
# Dar permissão ao script
chmod +x start.sh
```

### Erro: "Port already in use"
```bash
# Matar processos nas portas
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
cd backend && rm -rf venv && python3 -m venv venv
cd frontend && rm -rf node_modules && npm install
```

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a seção de solução de problemas
2. Consulte a documentação da API em `/docs`
3. Abra uma issue no repositório

## ✨ Demo Online

🔗 **[Ver Demo ao Vivo](https://seu-usuario.github.io/financial-dashboard)** *(em breve)*

## 🎯 Funcionalidades

✅ **Gestão de Contas**: Múltiplas contas com saldos em tempo real  
✅ **Transações**: Criação, edição e exclusão de transações  
✅ **Categorização**: Organização por categorias personalizáveis  
✅ **Filtros Avançados**: Por período, tipo, categoria e descrição  
✅ **Gráficos Interativos**: Evolução do saldo com períodos configuráveis (7, 30, 60, 90, 120, 365 dias)  
✅ **Seleção de Contas**: Sistema de seleção múltipla com resumos  
✅ **Resumo Financeiro**: Saldos positivos/negativos consolidados  
✅ **Exportação**: Download completo dos dados em JSON  
✅ **Interface Responsiva**: Funciona perfeitamente em mobile e desktop  

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com Hooks
- **Material-UI (MUI)** para interface
- **MUI X Charts** para gráficos
- **Date-fns** para manipulação de datas

### Backend  
- **FastAPI** com Python
- **SQLAlchemy** ORM
- **SQLite** banco de dados
- **Uvicorn** servidor ASGI

## 📦 Instalação e Uso

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- npm ou yarn

### 🔧 Setup Rápido

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/financial-dashboard.git
cd financial-dashboard

# Execute o script de inicialização
chmod +x start.sh
./start.sh
```

O script irá:
1. Instalar dependências do backend e frontend
2. Inicializar o banco de dados
3. Executar backend (porta 8000) e frontend (porta 3000)

### 🔧 Setup Manual

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev  # ou npm start
```

## 📊 Dataset de Teste

Para testar todas as funcionalidades com dados realistas:

```bash
# Gerar dados de teste (6 meses de transações)
python generate_test_data.py

# Ver estatísticas detalhadas
python show_test_data_stats.py
```

## 🌐 API Endpoints

### Contas
- `GET /accounts/` - Listar todas as contas
- `POST /accounts/` - Criar nova conta
- `PUT /accounts/{id}` - Atualizar conta
- `PATCH /accounts/{id}/name` - Atualizar nome da conta
- `GET /accounts/{id}/balance-history` - Histórico de saldo

### Transações
- `GET /transactions/` - Listar transações (com filtros)
- `POST /transactions/` - Criar transação
- `PUT /transactions/{id}` - Atualizar transação
- `DELETE /transactions/{id}` - Excluir transação

### Exportação
- `GET /export` - Exportar todos os dados em JSON

## 🎨 Screenshots

### Dashboard Principal
![Dashboard](docs/dashboard.png)

### Gráficos Interativos
![Charts](docs/charts.png)

### Mobile Responsivo
![Mobile](docs/mobile.png)

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - seu.email@gmail.com

Link do Projeto: [https://github.com/SEU_USUARIO/financial-dashboard](https://github.com/SEU_USUARIO/financial-dashboard)

---

⭐ **Se este projeto te ajudou, dê uma estrela!** ⭐ 