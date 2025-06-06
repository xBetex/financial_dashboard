import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

const MonthlyExpensesSummary = ({ selectedAccountIds = [], accounts = [] }) => {
  // Estados para seleção de período
  const [periodType, setPeriodType] = useState('current'); // 'current', 'custom', 'range'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rangeType, setRangeType] = useState('3months'); // '3months', '6months', 'year'
  
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    incomeTransactions: 0,
    expenseTransactions: 0,
    loading: true
  });

  // Memoizar os IDs das contas para evitar re-renders desnecessários
  const accountsToFilter = useMemo(() => {
    return selectedAccountIds.length > 0 ? selectedAccountIds : accounts.map(acc => acc.id);
  }, [selectedAccountIds, accounts]);

  // Função para calcular período baseado no tipo selecionado
  const calculatePeriodParams = useCallback(() => {
    const currentDate = new Date();
    
    if (periodType === 'current') {
      return {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      };
    } else if (periodType === 'custom') {
      return {
        month: selectedMonth,
        year: selectedYear
      };
    } else if (periodType === 'range') {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (rangeType) {
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 3);
      }
      
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    }
    
    return { month: currentDate.getMonth() + 1, year: currentDate.getFullYear() };
  }, [periodType, selectedMonth, selectedYear, rangeType]);

  // Debounce para evitar muitas chamadas seguidas
  const fetchMonthlyData = useCallback(async () => {
    setMonthlyData(prev => ({ ...prev, loading: true }));
    
    try {
      const params = calculatePeriodParams();
      let url = 'http://localhost:8000/transactions/';
      
      if (params.startDate && params.endDate) {
        // Para ranges (últimos X meses/ano)
        url += `?start_date=${params.startDate}&end_date=${params.endDate}`;
      } else {
        // Para mês específico
        url += `?month=${params.month}&year=${params.year}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar transações');
      }
      
      const transactions = await response.json();
      
      // Filtrar transações pelas contas selecionadas
      const filteredTransactions = transactions.filter(t => 
        accountsToFilter.includes(t.account_id)
      );
      
      const incomeTransactions = filteredTransactions.filter(t => t.transaction_type === 'entrada');
      const expenseTransactions = filteredTransactions.filter(t => t.transaction_type === 'saida');
      
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const netBalance = totalIncome - totalExpenses;
      
      setMonthlyData({
        totalIncome,
        totalExpenses,
        netBalance,
        incomeTransactions: incomeTransactions.length,
        expenseTransactions: expenseTransactions.length,
        loading: false
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error);
      setMonthlyData(prev => ({ ...prev, loading: false }));
    }
  }, [accountsToFilter, calculatePeriodParams]);

  useEffect(() => {
    // Debounce de 300ms para evitar chamadas excessivas
    const timeoutId = setTimeout(() => {
      fetchMonthlyData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchMonthlyData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount || 0);
  };

  const getProgressPercentage = () => {
    if (monthlyData.totalIncome === 0) return 0;
    return Math.min((monthlyData.totalExpenses / monthlyData.totalIncome) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage <= 50) return 'success';
    if (percentage <= 80) return 'warning';
    return 'error';
  };

  const getSelectedAccountsText = () => {
    if (selectedAccountIds.length === 0) {
      return 'Todas as contas';
    }
    
    const selectedNames = accounts
      .filter(acc => selectedAccountIds.includes(acc.id))
      .map(acc => acc.name);
    
    if (selectedNames.length <= 2) {
      return selectedNames.join(', ');
    }
    
    return `${selectedNames[0]} e mais ${selectedNames.length - 1}`;
  };

  const getPeriodTitle = () => {
    if (periodType === 'current') {
      const currentDate = new Date();
      return currentDate.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (periodType === 'custom') {
      const date = new Date(selectedYear, selectedMonth - 1);
      return date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else if (periodType === 'range') {
      switch (rangeType) {
        case '3months':
          return 'Últimos 3 Meses';
        case '6months':
          return 'Últimos 6 Meses';
        case 'year':
          return 'Último Ano';
        default:
          return 'Período Personalizado';
      }
    }
    return 'Resumo Financeiro';
  };

  // Lista de meses para o seletor
  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];

  // Lista de anos (últimos 5 anos + próximos 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  if (monthlyData.loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <CalendarIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6" fontWeight="bold">
              📊 Resumo de {getPeriodTitle()}
            </Typography>
          </Box>
        </Box>

        {/* Controles de Período */}
        <Box mb={3}>
          <ToggleButtonGroup
            value={periodType}
            exclusive
            onChange={(event, newPeriodType) => {
              if (newPeriodType !== null) {
                setPeriodType(newPeriodType);
              }
            }}
            aria-label="tipo de período"
            size="small"
            sx={{ mb: 2 }}
          >
            <ToggleButton value="current" aria-label="mês atual">
              Mês Atual
            </ToggleButton>
            <ToggleButton value="custom" aria-label="mês específico">
              Mês Específico
            </ToggleButton>
            <ToggleButton value="range" aria-label="período">
              Período
            </ToggleButton>
          </ToggleButtonGroup>

          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            {periodType === 'custom' && (
              <>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Mês</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="Mês"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Ano</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Ano"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {periodType === 'range' && (
              <ToggleButtonGroup
                value={rangeType}
                exclusive
                onChange={(event, newRangeType) => {
                  if (newRangeType !== null) {
                    setRangeType(newRangeType);
                  }
                }}
                aria-label="tipo de período"
                size="small"
              >
                <ToggleButton value="3months" aria-label="3 meses">
                  3 Meses
                </ToggleButton>
                <ToggleButton value="6months" aria-label="6 meses">
                  6 Meses
                </ToggleButton>
                <ToggleButton value="year" aria-label="1 ano">
                  1 Ano
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Contas: {getSelectedAccountsText()}
        </Typography>

        <Grid container spacing={3}>
          {/* Entradas */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: '#e8f5e8',
                border: '1px solid #4caf50'
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="success.dark">
                  Entradas
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatCurrency(monthlyData.totalIncome)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {monthlyData.incomeTransactions} transações
              </Typography>
            </Box>
          </Grid>

          {/* Saídas */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: '#ffebee',
                border: '1px solid #f44336'
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="error.dark">
                  Saídas
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {formatCurrency(monthlyData.totalExpenses)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {monthlyData.expenseTransactions} transações
              </Typography>
            </Box>
          </Grid>

          {/* Saldo Líquido */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: monthlyData.netBalance >= 0 ? '#e3f2fd' : '#fff3e0',
                border: monthlyData.netBalance >= 0 ? '1px solid #2196f3' : '1px solid #ff9800'
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <BalanceIcon 
                  color={monthlyData.netBalance >= 0 ? 'primary' : 'warning'} 
                  sx={{ mr: 1 }} 
                />
                <Typography 
                  variant="subtitle2" 
                  color={monthlyData.netBalance >= 0 ? 'primary.dark' : 'warning.dark'}
                >
                  Saldo Líquido
                </Typography>
              </Box>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color={monthlyData.netBalance >= 0 ? 'primary.main' : 'warning.main'}
              >
                {formatCurrency(monthlyData.netBalance)}
              </Typography>
              <Chip 
                label={monthlyData.netBalance >= 0 ? 'Positivo' : 'Negativo'}
                color={monthlyData.netBalance >= 0 ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>

        {/* Barra de Progresso de Gastos */}
        <Box mt={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">
              Uso do Orçamento
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getProgressPercentage().toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()} 
            color={getProgressColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {monthlyData.totalIncome > 0 
              ? `Você gastou ${getProgressPercentage().toFixed(1)}% da sua receita mensal`
              : 'Nenhuma receita registrada este mês'
            }
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MonthlyExpensesSummary; 