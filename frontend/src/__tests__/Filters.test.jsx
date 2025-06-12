import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Filters from '../components/Filters';

describe('Filters Component', () => {
  const mockAccounts = [
    { id: 1, name: 'Conta Corrente' },
    { id: 2, name: 'Poupança' }
  ];

  const mockFilters = {
    month: '',
    year: '',
    transactionType: '',
    category: '',
    accountId: '',
    description: '',
    minAmount: '',
    maxAmount: ''
  };

  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('renderiza o componente corretamente', () => {
    render(
      <Filters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        accounts={mockAccounts}
      />
    );

    expect(screen.getByText(/Filtros/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Digite para pesquisar/i)).toBeInTheDocument();
  });

  it('permite pesquisar por descrição', () => {
    render(
      <Filters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        accounts={mockAccounts}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Digite para pesquisar/i);
    fireEvent.change(searchInput, { target: { value: 'Mercado' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ description: 'Mercado' });
  });

  it('expande e colapsa seções de filtro', () => {
    render(
      <Filters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        accounts={mockAccounts}
      />
    );

    // Inicialmente todas as seções estão fechadas
    expect(screen.queryByLabelText(/Mês/i)).not.toBeInTheDocument();

    // Clica para expandir a seção de período
    fireEvent.click(screen.getByText(/📅 Período/i));
    expect(screen.getByLabelText(/Mês/i)).toBeInTheDocument();

    // Clica novamente para colapsar
    fireEvent.click(screen.getByText(/📅 Período/i));
    expect(screen.queryByLabelText(/Mês/i)).not.toBeInTheDocument();
  });

  it('aplica múltiplos filtros corretamente', async () => {
    render(
      <Filters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        accounts={mockAccounts}
      />
    );

    // Expande seção de período
    fireEvent.click(screen.getByText(/📅 Período/i));
    
    // Seleciona mês
    const monthSelect = screen.getByLabelText(/Mês/i);
    fireEvent.mouseDown(monthSelect);
    const monthOptions = screen.getByRole('listbox');
    fireEvent.click(within(monthOptions).getByText(/Janeiro/i));
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ month: 1 });

    // Expande seção de tipo e categoria
    fireEvent.click(screen.getByText(/🏷️ Tipo e Categoria/i));
    
    // Seleciona tipo de transação
    const typeSelect = screen.getByLabelText(/Tipo/i);
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getByRole('listbox');
    fireEvent.click(within(typeOptions).getByText(/💚 Receita/i));
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ transactionType: 'income' });

    // Expande seção de valor
    fireEvent.click(screen.getByText(/💰 Valor/i));
    
    // Define valor mínimo
    const minAmountInput = screen.getByLabelText(/Mínimo/i);
    fireEvent.change(minAmountInput, { target: { value: '100' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ minAmount: '100' });
  });

  it('limpa todos os filtros', () => {
    const activeFilters = {
      month: 1,
      year: 2024,
      transactionType: 'income',
      category: 'Alimentação',
      accountId: 1,
      description: 'Mercado',
      minAmount: '100',
      maxAmount: '500'
    };

    render(
      <Filters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        accounts={mockAccounts}
      />
    );

    // Verifica se os chips de filtros ativos estão presentes
    expect(screen.getByText(/🔍 "Mercado"/i)).toBeInTheDocument();
    expect(screen.getByText(/📅 Janeiro/i)).toBeInTheDocument();
    expect(screen.getByText(/📆 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/💰 Receita/i)).toBeInTheDocument();
    expect(screen.getByText(/🏷️ Alimentação/i)).toBeInTheDocument();
    expect(screen.getByText(/🏦 Conta Corrente/i)).toBeInTheDocument();
    expect(screen.getByText(/💲 Min: R\$ 100/i)).toBeInTheDocument();
    expect(screen.getByText(/💲 Max: R\$ 500/i)).toBeInTheDocument();

    // Clica no botão de limpar filtros
    fireEvent.click(screen.getByTitle(/Limpar todos os filtros/i));

    // Verifica se a função foi chamada com os filtros vazios
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      month: '',
      year: '',
      transactionType: '',
      category: '',
      accountId: '',
      description: '',
      minAmount: '',
      maxAmount: ''
    });
  });

  it('remove filtros individuais através dos chips', () => {
    const activeFilters = {
      description: 'Mercado',
      month: 1,
      transactionType: 'income'
    };

    render(
      <Filters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        accounts={mockAccounts}
      />
    );

    // Remove o filtro de descrição
    const descriptionChip = screen.getByText(/🔍 "Mercado"/i);
    fireEvent.click(descriptionChip.parentElement.querySelector('svg')); // Clica no botão de fechar do chip
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ description: '' });

    // Remove o filtro de mês
    const monthChip = screen.getByText(/📅 Janeiro/i);
    fireEvent.click(monthChip.parentElement.querySelector('svg'));
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ month: '' });

    // Remove o filtro de tipo
    const typeChip = screen.getByText(/💰 Receita/i);
    fireEvent.click(typeChip.parentElement.querySelector('svg'));
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ transactionType: '' });
  });
}); 