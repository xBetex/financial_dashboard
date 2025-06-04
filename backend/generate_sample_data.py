import sqlite3
from datetime import datetime, timedelta
import random

# Database connection
def get_db_connection():
    conn = sqlite3.connect('financial_dashboard.db')
    conn.row_factory = sqlite3.Row
    return conn

# Create tables
def create_tables():
    conn = get_db_connection()
    
    # Create accounts table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            balance REAL NOT NULL DEFAULT 0.0
        )
    ''')
    
    # Create transactions table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TIMESTAMP NOT NULL,
            description TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            category TEXT,
            amount REAL NOT NULL,
            account_id INTEGER,
            FOREIGN KEY (account_id) REFERENCES accounts (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Generate sample accounts
def create_sample_accounts():
    conn = get_db_connection()
    
    # Clear existing accounts to avoid duplicates
    conn.execute("DELETE FROM accounts")
    conn.commit()
    
    accounts = [
        ("Conta Corrente Principal", 2500.00),
        ("Conta Poupança", 15000.00),
        ("Carteira", 150.00),
        ("Conta Investimentos", 25000.00)
    ]
    
    for name, initial_balance in accounts:
        conn.execute(
            "INSERT INTO accounts (name, balance) VALUES (?, ?)",
            (name, initial_balance)
        )
    
    conn.commit()
    conn.close()
    print("✅ Contas criadas com sucesso!")

# Generate sample transactions
def create_sample_transactions():
    conn = get_db_connection()
    
    # Clear existing transactions to avoid duplicates
    conn.execute("DELETE FROM transactions")
    conn.commit()
    
    # Get account IDs
    accounts = conn.execute("SELECT id, name FROM accounts").fetchall()
    account_ids = [acc['id'] for acc in accounts]
    
    # Categories for expenses
    expense_categories = [
        "Alimentação", "Transporte", "Moradia", "Saúde", "Educação",
        "Entretenimento", "Vestuário", "Supermercado", "Restaurantes",
        "Combustível", "Farmácia", "Academia", "Cinema", "Shopping",
        "Contas Obrigatórias"
    ]
    
    # Categories for income
    income_categories = [
        "Salário", "Emprestimo", "Transferencia bancária", "Investimentos", "Bônus", "Dividendos"
    ]
    
    # Sample transaction descriptions
    expense_descriptions = {
        "Alimentação": ["Supermercado", "Padaria", "Feira", "Açougue"],
        "Transporte": ["Uber", "Gasolina", "Estacionamento", "Ônibus"],
        "Moradia": ["Aluguel", "Condomínio", "Energia elétrica", "Água"],
        "Saúde": ["Consulta médica", "Medicamentos", "Exames", "Dentista"],
        "Educação": ["Curso online", "Livros", "Material escolar", "Mensalidade"],
        "Entretenimento": ["Cinema", "Teatro", "Streaming", "Jogos"],
        "Vestuário": ["Roupas", "Sapatos", "Acessórios", "Costura"],
        "Supermercado": ["Compras mensais", "Produtos de limpeza", "Higiene"],
        "Restaurantes": ["Almoço", "Jantar", "Lanche", "Delivery"],
        "Combustível": ["Posto", "Gasolina", "Álcool", "Diesel"],
        "Farmácia": ["Medicamentos", "Vitaminas", "Produtos de higiene"],
        "Academia": ["Mensalidade", "Personal trainer", "Suplementos"],
        "Cinema": ["Ingresso", "Pipoca", "Filme 3D"],
        "Shopping": ["Compras variadas", "Presentes", "Eletônicos"],
        "Contas Obrigatórias": ["Aluguel", "Financiamento", "Cartão de crédito", "Empréstimo"]
    }
    
    income_descriptions = {
        "Salário": ["Salário mensal", "Adiantamento", "13º salário"],
        "Emprestimo": ["Empréstimo bancário", "Empréstimo pessoal", "Financiamento"],
        "Transferencia bancária": ["Transferência recebida", "PIX recebido", "TED recebida"],
        "Investimentos": ["Rendimento CDB", "Dividendos", "Juros poupança"],
        "Bônus": ["Bônus performance", "Participação nos lucros"],
        "Dividendos": ["Ações", "Fundos imobiliários"]
    }
    
    transactions = []
    
    # Generate transactions for the last 6 months
    start_date = datetime.now() - timedelta(days=180)
    
    for day in range(180):
        current_date = start_date + timedelta(days=day)
        
        # Generate 1-5 transactions per day randomly
        num_transactions = random.randint(0, 4)
        
        for _ in range(num_transactions):
            account_id = random.choice(account_ids)
            
            # 80% chance of expense, 20% chance of income
            if random.random() < 0.8:
                # Expense transaction
                transaction_type = "saida"
                category = random.choice(expense_categories)
                description = random.choice(expense_descriptions.get(category, [category]))
                
                # Different amount ranges based on category
                if category in ["Moradia", "Salário"]:
                    amount = round(random.uniform(800, 1500), 2)
                elif category in ["Supermercado", "Combustível"]:
                    amount = round(random.uniform(50, 200), 2)
                elif category in ["Restaurantes", "Entretenimento"]:
                    amount = round(random.uniform(20, 100), 2)
                else:
                    amount = round(random.uniform(10, 300), 2)
            else:
                # Income transaction
                transaction_type = "entrada"
                category = random.choice(income_categories)
                description = random.choice(income_descriptions.get(category, [category]))
                
                if category == "Salário":
                    amount = round(random.uniform(3000, 8000), 2)
                elif category == "Emprestimo":
                    amount = round(random.uniform(500, 2000), 2)
                elif category == "Transferencia bancária":
                    amount = round(random.uniform(100, 1000), 2)
                else:
                    amount = round(random.uniform(100, 1000), 2)
            
            # Add some time variation to the date
            transaction_time = current_date.replace(
                hour=random.randint(6, 22),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            transactions.append((
                transaction_time,
                description,
                transaction_type,
                category,
                amount,
                account_id
            ))
    
    # Insert transactions
    conn.executemany(
        "INSERT INTO transactions (date, description, transaction_type, category, amount, account_id) VALUES (?, ?, ?, ?, ?, ?)",
        transactions
    )
    
    conn.commit()
    
    print(f"✅ {len(transactions)} transações criadas com sucesso!")
    
    # Update account balances based on transactions
    update_account_balances()
    
    conn.close()

def update_account_balances():
    conn = get_db_connection()
    
    # Get all accounts
    accounts = conn.execute("SELECT id, name FROM accounts").fetchall()
    
    for account in accounts:
        account_id = account['id']
        
        # Calculate balance from transactions
        income_sum = conn.execute(
            "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE account_id = ? AND transaction_type = 'entrada'",
            (account_id,)
        ).fetchone()[0]
        
        expense_sum = conn.execute(
            "SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE account_id = ? AND transaction_type = 'saida'",
            (account_id,)
        ).fetchone()[0]
        
        # Start with initial balance and add/subtract transactions
        balance = income_sum - expense_sum
        
        # Update account balance
        conn.execute(
            "UPDATE accounts SET balance = ? WHERE id = ?",
            (balance, account_id)
        )
    
    conn.commit()
    print("✅ Saldos das contas atualizados!")

def main():
    print("🚀 Gerando dados de exemplo para o Financial Dashboard...")
    
    # Create tables
    create_tables()
    print("✅ Tabelas criadas!")
    
    # Create sample accounts
    create_sample_accounts()
    
    # Create sample transactions
    create_sample_transactions()
    
    # Show summary
    conn = get_db_connection()
    
    account_count = conn.execute("SELECT COUNT(*) FROM accounts").fetchone()[0]
    transaction_count = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
    
    print(f"\n📊 Resumo dos dados gerados:")
    print(f"   • {account_count} contas criadas")
    print(f"   • {transaction_count} transações criadas")
    
    # Show accounts with balances
    print(f"\n💰 Contas criadas:")
    accounts = conn.execute("SELECT name, balance FROM accounts").fetchall()
    for account in accounts:
        print(f"   • {account['name']}: R$ {account['balance']:,.2f}")
    
    conn.close()
    print(f"\n✅ Dados gerados com sucesso! O banco de dados está pronto para uso.")

if __name__ == "__main__":
    main() 