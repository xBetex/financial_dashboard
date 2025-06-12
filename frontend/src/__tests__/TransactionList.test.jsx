import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TransactionList from '../components/TransactionList';

describe('TransactionList Component', () => {
  const mockAccounts = [
    { id: 1, name: 'Conta Corrente' },
    { id: 2, name: 'Poupança' }
  ];

  const mockTransactions = [
    {
      id: 1,
      date: '2024-03-15T10:00:00Z',
      description: 'Supermercado',
      transaction_type: 'saida',
      category: 'Alimentação',
      amount: 150.50,
      account_id: 1
    },
    {
      id: 2,
      date: '2024-03-15T11:00:00Z',
      description: 'Salário',
      transaction_type: 'entrada',
      category: 'Salário',
      amount: 5000.00,
      account_id: 1
    },
    {
      id: 3,
      date: '2024-03-14T09:00:00Z',
      description: 'Investimento',
      transaction_type: 'saida',
      category: 'Investimentos',
      amount: 1000.00,
      account_id: 2
    }
  ];

  const mockOnTransactionUpdate = jest.fn();
  const mockOnTransactionDelete = jest.fn();

  beforeEach(() => {
    mockOnTransactionUpdate.mockClear();
    mockOnTransactionDelete.mockClear();
  });

  it('renderiza a lista de transações corretamente', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        loading={false}
        onTransactionUpdate={mockOnTransactionUpdate}
        onTransactionDelete={mockOnTransactionDelete}
      />
    );

    // Verifica se todas as transações estão sendo exibidas
    expect(screen.getByText(/Supermercado/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Salário/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Investimento/i)).toBeInTheDocument();
  });

  it('agrupa transações por mês', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        loading={false}
        onTransactionUpdate={mockOnTransactionUpdate}
        onTransactionDelete={mockOnTransactionDelete}
      />
    );

    // Verifica se as transações estão agrupadas por mês
    expect(screen.getByText(/Março 2024/i)).toBeInTheDocument();
  });

  it('exibe mensagem quando não há transações', () => {
    render(
      <TransactionList
        transactions={[]}
        accounts={mockAccounts}
        loading={false}
        onTransactionUpdate={mockOnTransactionUpdate}
        onTransactionDelete={mockOnTransactionDelete}
      />
    );

    expect(screen.getByText(/Nenhuma transação encontrada/i)).toBeInTheDocument();
  });

  it('exibe loading quando está carregando', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        loading={true}
        onTransactionUpdate={mockOnTransactionUpdate}
        onTransactionDelete={mockOnTransactionDelete}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('permite editar uma transação', async () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        loading={false}
        onTransactionUpdate={mockOnTransactionUpdate}
        onTransactionDelete={mockOnTransactionDelete}
      />
    );

    // Abre o menu de contexto da primeira transação
    const firstTransaction = screen.getByText(/Supermercado/i);
    fireEvent.contextMenu(firstTransaction);

    // Clica no botão de editar
    fireEvent.click(screen.getByText(/Editar/i));

    // Verifica se o diálogo de edição foi aberto
    expect(screen.getByText(/Editar Transação/i)).toBeInTheDocument();

    // Modifica a descrição
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    fireEvent.change(descriptionInput, { target: { value: 'Mercado Novo' } });

    // Salva as alterações
    fireEvent.click(screen.getByText(/Salvar/i));

    // Verifica se a função de atualização foi chamada com os dados corretos
    expect(mockOnTransactionUpdate).toHaveBeenCalledWith(1, expect.objectContaining({
      description: 'Mercado Novo'
    }));
  });

  it('permite excluir uma transação', async () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        loading={false}
        onTransactionUpdate={mockOnTransactionUpdate}
        onTransactionDelete={mockOnTransactionDelete}
      />
    );

    // Abre o menu de contexto da primeira transação
    const firstTransaction = screen.getByText(/Supermercado/i);
    fireEvent.contextMenu(firstTransaction);

    // Clica no botão de excluir
    fireEvent.click(screen.getByText(/Excluir/i));

    // Verifica se o diálogo de confirmação foi aberto
    expect(screen.getByText(/Confirmar Exclusão/i)).toBeInTheDocument();

    // Confirma a exclusão
    fireEvent.click(screen.getByText(/Sim/i));

    // Verifica se a função de exclusão foi chamada com o ID correto
    expect(mockOnTransactionDelete).toHaveBeenCalledWith(1);
  });

  it('formata valores monetários corretamente', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        loading={false}
        onTransactionUpdate={mockOnTransactionUpdate}
        onTransactionDelete={mockOnTransactionDelete}
      />
    );

    // Verifica se os valores estão formatados corretamente
    expect(screen.getByText(/R\$ 150,50/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 5\.000,00/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 1\.000,00/i)).toBeInTheDocument();
  });

  it('exibe o nome da conta corretamente', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        loading={false}
        onTransactionUpdate={mockOnTransactionUpdate}
        onTransactionDelete={mockOnTransactionDelete}
      />
    );

    // Verifica se os nomes das contas estão sendo exibidos
    const contaCorrenteElements = screen.getAllByText(/Conta Corrente/i);
    expect(contaCorrenteElements.length).toBe(2);
    expect(screen.getByText(/Poupança/i)).toBeInTheDocument();
  });
}); 