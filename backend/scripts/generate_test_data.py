import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, create_tables, engine
from models.account import Account
from models.transaction import Transaction
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session

# Configurações para geração de dados
NUMERO_DE_CONTAS = 3
NUMERO_DE_TRANSACOES = 100
DATA_INICIAL = datetime(2024, 1, 1)
DATA_FINAL = datetime(2024, 3, 15)

# Dados para geração aleatória
CATEGORIAS_ENTRADA = [
    'Salário',
    'Freelance',
    'Investimentos',
    'Outros'
]

CATEGORIAS_SAIDA = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Entretenimento',
    'Vestuário',
    'Outros'
]

DESCRICOES_ENTRADA = {
    'Salário': ['Salário Mensal', 'Décimo Terceiro', 'Férias'],
    'Freelance': ['Projeto Website', 'Consultoria', 'Design Gráfico', 'Desenvolvimento App'],
    'Investimentos': ['Dividendos', 'Juros Poupança', 'Aluguel', 'Venda de Ações'],
    'Outros': ['Venda Item Usado', 'Presente', 'Reembolso', 'Cashback']
}

DESCRICOES_SAIDA = {
    'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Padaria', 'Lanche'],
    'Transporte': ['Combustível', 'Uber', 'Ônibus', 'Metrô', 'Estacionamento'],
    'Moradia': ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet', 'IPTU'],
    'Saúde': ['Consulta Médica', 'Farmácia', 'Plano de Saúde', 'Academia'],
    'Educação': ['Mensalidade Curso', 'Material Escolar', 'Livros', 'Curso Online'],
    'Entretenimento': ['Cinema', 'Netflix', 'Spotify', 'Show', 'Teatro'],
    'Vestuário': ['Roupas', 'Calçados', 'Acessórios'],
    'Outros': ['Material de Limpeza', 'Presente', 'Manutenção', 'Assinaturas']
}

def gerar_valor_aleatorio(tipo: str) -> float:
    if tipo == "entrada":
        # Valores de entrada entre R$ 1000 e R$ 5000
        return round(random.uniform(1000, 5000), 2)
    else:
        # Valores de saída entre R$ 10 e R$ 1000
        return round(random.uniform(10, 1000), 2)

def gerar_data_aleatoria(data_inicial: datetime, data_final: datetime) -> datetime:
    diferenca = data_final - data_inicial
    dias_aleatorios = random.randint(0, diferenca.days)
    return data_inicial + timedelta(days=dias_aleatorios)

def criar_contas(db: Session) -> list[Account]:
    contas = [
        Account(name="Conta Principal", balance=5000.0),
        Account(name="Conta Poupança", balance=10000.0),
        Account(name="Conta Investimentos", balance=15000.0)
    ]
    
    for conta in contas:
        db.add(conta)
    
    db.commit()
    for conta in contas:
        db.refresh(conta)
    
    return contas

def gerar_transacao(contas: list[Account]) -> dict:
    tipo = random.choice(["entrada", "saida"])
    
    if tipo == "entrada":
        categoria = random.choice(CATEGORIAS_ENTRADA)
        descricao = random.choice(DESCRICOES_ENTRADA[categoria])
    else:
        categoria = random.choice(CATEGORIAS_SAIDA)
        descricao = random.choice(DESCRICOES_SAIDA[categoria])
    
    return {
        "date": gerar_data_aleatoria(DATA_INICIAL, DATA_FINAL),
        "description": descricao,
        "transaction_type": tipo,
        "category": categoria,
        "amount": gerar_valor_aleatorio(tipo),
        "account_id": random.choice(contas).id
    }

def main():
    # Criar tabelas (caso não existam)
    create_tables()
    
    # Criar sessão do banco de dados
    db = SessionLocal()
    
    try:
        # Limpar dados existentes
        db.query(Transaction).delete()
        db.query(Account).delete()
        db.commit()
        
        print("Gerando dados de teste...")
        
        # Criar contas
        contas = criar_contas(db)
        print(f"Criadas {len(contas)} contas")
        
        # Gerar transações
        for _ in range(NUMERO_DE_TRANSACOES):
            transacao_data = gerar_transacao(contas)
            transacao = Transaction(**transacao_data)
            db.add(transacao)
            
            # Atualizar saldo da conta
            conta = db.query(Account).filter(Account.id == transacao_data["account_id"]).first()
            if transacao_data["transaction_type"] == "entrada":
                conta.balance += transacao_data["amount"]
            else:
                conta.balance -= transacao_data["amount"]
        
        db.commit()
        print(f"Geradas {NUMERO_DE_TRANSACOES} transações")
        
        # Mostrar resumo
        for conta in contas:
            db.refresh(conta)
            print(f"Conta: {conta.name} - Saldo: R$ {conta.balance:.2f}")
            
    except Exception as e:
        print(f"Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main() 