import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';

const MonthlyExpensesSummary = ({ selectedAccountIds = [], accounts = [] }) => {
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    incomeTransactions: 0,
    expenseTransactions: 0,
    loading: true
  });

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedAccountIds]);

  const fetchMonthlyData = async () => {
    setMonthlyData(prev => ({ ...prev, loading: true }));
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Se nenhuma conta estiver selecionada, usar todas
      const accountsToFilter = selectedAccountIds.length > 0 ? selectedAccountIds : accounts.map(acc => acc.id);
      
      const response = await fetch(`http://localhost:8000/transactions/?month=${currentMonth}&year=${currentYear}`);
      
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
  };

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

  const getCurrentMonthYear = () => {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

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
        <Box display="flex" alignItems="center" mb={3}>
          <BalanceIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6" fontWeight="bold">
            📊 Resumo de {getCurrentMonthYear()}
          </Typography>
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