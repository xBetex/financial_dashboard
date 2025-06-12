import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

// Mock do fetch para simular chamadas à API
global.fetch = jest.fn();

describe('Integração de Filtros e Lista de Transações', () => {
  const mockAccounts = [
    { id: 1, name: 'Conta Corrente', balance: 5000 },
    { id: 2, name: 'Poupança', balance: 10000 }
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

  beforeEach(() => {
    fetch.mockClear();

    // Mock das chamadas à API
    fetch.mockImplementation((url) => {
      if (url.includes('/accounts')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAccounts)
        });
      }
      if (url.includes('/transactions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTransactions)
        });
      }
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' })
        });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  it('carrega dados iniciais corretamente', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Verifica se os dados foram carregados
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.getByText('Investimento')).toBeInTheDocument();
  });

  it('filtra transações por descrição', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Digita no campo de pesquisa
    const searchInput = screen.getByPlaceholderText('Digite para pesquisar...');
    fireEvent.change(searchInput, { target: { value: 'Mercado' } });

    // Verifica se apenas a transação do supermercado está visível
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    expect(screen.queryByText('Investimento')).not.toBeInTheDocument();
  });

  it('filtra transações por tipo', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Expande a seção de tipo e categoria
    fireEvent.click(screen.getByText('🏷️ Tipo e Categoria'));

    // Seleciona apenas receitas
    const typeSelect = screen.getByLabelText('Tipo');
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getByRole('listbox');
    fireEvent.click(within(typeOptions).getByText('💚 Receita'));

    // Verifica se apenas as receitas estão visíveis
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.queryByText('Investimento')).not.toBeInTheDocument();
  });

  it('filtra transações por categoria', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Expande a seção de tipo e categoria
    fireEvent.click(screen.getByText('🏷️ Tipo e Categoria'));

    // Seleciona categoria Alimentação
    const categorySelect = screen.getByLabelText('Categoria');
    fireEvent.mouseDown(categorySelect);
    const categoryOptions = screen.getByRole('listbox');
    fireEvent.click(within(categoryOptions).getByText('Alimentação'));

    // Verifica se apenas as transações da categoria selecionada estão visíveis
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    expect(screen.queryByText('Investimento')).not.toBeInTheDocument();
  });

  it('filtra transações por conta', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Expande a seção de conta
    fireEvent.click(screen.getByText('🏦 Conta'));

    // Seleciona a conta poupança
    const accountSelect = screen.getByLabelText('Conta');
    fireEvent.mouseDown(accountSelect);
    const accountOptions = screen.getByRole('listbox');
    fireEvent.click(within(accountOptions).getByText('Poupança'));

    // Verifica se apenas as transações da conta selecionada estão visíveis
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    expect(screen.getByText('Investimento')).toBeInTheDocument();
  });

  it('filtra transações por valor', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Expande a seção de valor
    fireEvent.click(screen.getByText('💰 Valor'));

    // Define valor mínimo
    const minAmountInput = screen.getByLabelText('Mínimo');
    fireEvent.change(minAmountInput, { target: { value: '1000' } });

    // Verifica se apenas as transações com valor maior que 1000 estão visíveis
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.getByText('Investimento')).toBeInTheDocument();
  });

  it('combina múltiplos filtros', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Expande a seção de tipo e categoria
    fireEvent.click(screen.getByText('🏷️ Tipo e Categoria'));

    // Seleciona apenas despesas
    const typeSelect = screen.getByLabelText('Tipo');
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getByRole('listbox');
    fireEvent.click(within(typeOptions).getByText('💸 Despesa'));

    // Expande a seção de valor
    fireEvent.click(screen.getByText('💰 Valor'));

    // Define valor mínimo
    const minAmountInput = screen.getByLabelText('Mínimo');
    fireEvent.change(minAmountInput, { target: { value: '1000' } });

    // Verifica se apenas as despesas com valor maior que 1000 estão visíveis
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    expect(screen.getByText('Investimento')).toBeInTheDocument();
  });

  it('limpa todos os filtros', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Aplica alguns filtros
    fireEvent.click(screen.getByText('🏷️ Tipo e Categoria'));
    const typeSelect = screen.getByLabelText('Tipo');
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getByRole('listbox');
    fireEvent.click(within(typeOptions).getByText('💸 Despesa'));

    // Verifica se os filtros foram aplicados
    expect(screen.queryByText('Salário')).not.toBeInTheDocument();

    // Limpa todos os filtros
    fireEvent.click(screen.getByTitle('Limpar todos os filtros'));

    // Verifica se todas as transações estão visíveis novamente
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.getByText('Investimento')).toBeInTheDocument();
  });

  it('remove filtros individuais através dos chips', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Aplica múltiplos filtros
    fireEvent.click(screen.getByText('🏷️ Tipo e Categoria'));
    const typeSelect = screen.getByLabelText('Tipo');
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getByRole('listbox');
    fireEvent.click(within(typeOptions).getByText('💸 Despesa'));

    fireEvent.click(screen.getByText('💰 Valor'));
    const minAmountInput = screen.getByLabelText('Mínimo');
    fireEvent.change(minAmountInput, { target: { value: '1000' } });

    // Remove o filtro de tipo através do chip
    const typeChip = screen.getByText('💰 Despesa');
    fireEvent.click(typeChip.parentElement.querySelector('svg'));

    // Verifica se apenas o filtro de valor permanece ativo
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.getByText('Investimento')).toBeInTheDocument();
  });
}); 