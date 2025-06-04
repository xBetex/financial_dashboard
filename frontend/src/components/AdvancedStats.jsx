import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  Alert,
  Button,
  Collapse,
  IconButton,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CategoryIcon from '@mui/icons-material/Category';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#C44569', '#F8B500', '#6C5CE7', '#A29BFE', '#6C7B7F'
];

const AdvancedStats = ({ accounts = [], selectedAccountIds = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [valueFilters, setValueFilters] = useState({
    minAmount: '',
    maxAmount: '',
    transactionType: 'all'
  });
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthlyAverage: 0,
    largestExpense: 0,
    categoryStats: [],
    monthlyTrends: [],
    performanceMetrics: {}
  });

  // Initialize selected accounts based on props
  useEffect(() => {
    if (accounts.length > 0) {
      if (selectedAccountIds.length > 0) {
        setSelectedAccounts(selectedAccountIds);
      } else {
        // If no accounts are selected in the dashboard, select all accounts by default
        setSelectedAccounts(accounts.map(account => account.id));
      }
    }
  }, [accounts, selectedAccountIds]);

  const loadAdvancedStats = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if backend is running
      const healthResponse = await fetch('http://localhost:8000/health', {
        method: 'GET',
        timeout: 5000
      });
      
      if (!healthResponse.ok) {
        throw new Error('Backend não está respondendo. Verifique se o servidor está rodando.');
      }

      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '1month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 3);
      }

      const response = await fetch('http://localhost:8000/transactions/');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar transações: ${response.status} ${response.statusText}`);
      }
      
      const allTransactions = await response.json();
      
      if (!Array.isArray(allTransactions)) {
        throw new Error('Dados de transações inválidos recebidos do servidor');
      }
      
      // Filter transactions by period
      let filteredTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      // Filter by selected accounts
      if (selectedAccounts.length > 0) {
        filteredTransactions = filteredTransactions.filter(t => 
          selectedAccounts.includes(t.account_id)
        );
      }

      // Apply value filters
      if (valueFilters.minAmount !== '') {
        const minAmount = parseFloat(valueFilters.minAmount);
        filteredTransactions = filteredTransactions.filter(t => t.amount >= minAmount);
      }

      if (valueFilters.maxAmount !== '') {
        const maxAmount = parseFloat(valueFilters.maxAmount);
        filteredTransactions = filteredTransactions.filter(t => t.amount <= maxAmount);
      }

      if (valueFilters.transactionType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => 
          t.transaction_type === valueFilters.transactionType
        );
      }

      calculateStats(filteredTransactions);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error.message || 'Erro ao carregar estatísticas. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedAccounts, valueFilters]);

  useEffect(() => {
    loadAdvancedStats();
  }, [loadAdvancedStats]);

  const calculateStats = (transactions) => {
    if (!transactions || transactions.length === 0) {
      setStats({
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        monthlyAverage: 0,
        largestExpense: 0,
        categoryStats: [],
        monthlyTrends: [],
        performanceMetrics: {
          savingsRate: 0,
          expenseRatio: 0,
          avgDailyExpense: 0
        }
      });
      return;
    }

    const income = transactions.filter(t => t.transaction_type === 'entrada');
    const expenses = transactions.filter(t => t.transaction_type === 'saida');
    
    const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const netIncome = totalIncome - totalExpenses;

    // Category analysis
    const categoryMap = {};
    expenses.forEach(t => {
      const category = t.category || 'Não categorizado';
      if (categoryMap[category]) {
        categoryMap[category] += t.amount || 0;
      } else {
        categoryMap[category] = t.amount || 0;
      }
    });

    const categoryStats = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly trends
    const monthlyMap = {};
    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (isNaN(transactionDate.getTime())) return; // Skip invalid dates
      
      const monthKey = transactionDate.toISOString().substring(0, 7);
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { income: 0, expense: 0 };
      }
      
      if (t.transaction_type === 'entrada') {
        monthlyMap[monthKey].income += t.amount || 0;
      } else if (t.transaction_type === 'saida') {
        monthlyMap[monthKey].expense += t.amount || 0;
      }
    });

    const monthlyTrends = Object.entries(monthlyMap)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        }),
        monthKey: month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // Performance metrics
    const monthlyAverage = monthlyTrends.length > 0 
      ? monthlyTrends.reduce((sum, m) => sum + m.net, 0) / monthlyTrends.length 
      : 0;

    const largestExpense = expenses.length > 0 
      ? Math.max(...expenses.map(t => t.amount || 0)) 
      : 0;

    const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0;

    setStats({
      totalIncome,
      totalExpenses,
      netIncome,
      monthlyAverage,
      largestExpense,
      categoryStats,
      monthlyTrends,
      performanceMetrics: {
        savingsRate,
        expenseRatio: totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0,
        avgDailyExpense: expenses.length > 0 ? (totalExpenses / 30).toFixed(2) : 0
      }
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const handleValueFilterChange = (field) => (event) => {
    setValueFilters(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleAccountFilterChange = (event) => {
    const value = event.target.value;
    setSelectedAccounts(typeof value === 'string' ? value.split(',') : value);
  };

  const clearValueFilters = () => {
    setValueFilters({
      minAmount: '',
      maxAmount: '',
      transactionType: 'all'
    });
    // Reset selected accounts to all accounts
    if (accounts.length > 0) {
      setSelectedAccounts(accounts.map(account => account.id));
    }
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 5) return null; // Hide labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={loadAdvancedStats}>
                Tentar Novamente
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Erro:</strong> {error}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Certifique-se de que o backend está rodando em http://localhost:8000
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <LinearProgress sx={{ width: '100%', mb: 2 }} />
            <Typography>Carregando estatísticas avançadas...</Typography>
            <Typography variant="caption" color="text.secondary">
              Analisando dados financeiros
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          📊 Estatísticas Avançadas
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {selectedAccounts.length > 0 && (
            <Chip 
              label={`${selectedAccounts.length} de ${accounts.length} contas`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          <IconButton 
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? "primary" : "default"}
          >
            <FilterListIcon />
          </IconButton>
          <IconButton onClick={loadAdvancedStats} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={selectedPeriod}
              label="Período"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="1month">Último mês</MenuItem>
              <MenuItem value="3months">Últimos 3 meses</MenuItem>
              <MenuItem value="6months">Últimos 6 meses</MenuItem>
              <MenuItem value="1year">Último ano</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Value Filters */}
      <Collapse in={showFilters}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Filtros Avançados
            </Typography>
            <Grid container spacing={2}>
              {/* Account Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>🏦 Contas Selecionadas</InputLabel>
                  <Select
                    multiple
                    value={selectedAccounts}
                    onChange={handleAccountFilterChange}
                    input={<OutlinedInput label="🏦 Contas Selecionadas" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((accountId) => {
                          const account = accounts.find(acc => acc.id === accountId);
                          return (
                            <Chip 
                              key={accountId} 
                              label={account ? account.name : `Conta ${accountId}`} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        <Checkbox checked={selectedAccounts.includes(account.id)} />
                        <ListItemText primary={account.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  size="small"
                  label="Valor Mínimo"
                  type="number"
                  fullWidth
                  value={valueFilters.minAmount}
                  onChange={handleValueFilterChange('minAmount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  size="small"
                  label="Valor Máximo"
                  type="number"
                  fullWidth
                  value={valueFilters.maxAmount}
                  onChange={handleValueFilterChange('maxAmount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de Transação</InputLabel>
                  <Select
                    value={valueFilters.transactionType}
                    label="Tipo de Transação"
                    onChange={handleValueFilterChange('transactionType')}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    <MenuItem value="entrada">Apenas Receitas</MenuItem>
                    <MenuItem value="saida">Apenas Despesas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button 
                  variant="outlined" 
                  onClick={clearValueFilters}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  Limpar Filtros
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" color="white">
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Receita Total</Typography>
              </Box>
              <Typography variant="h4" color="white" fontWeight="bold">
                {formatCurrency(stats.totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" color="white">
                <TrendingDownIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Despesas Total</Typography>
              </Box>
              <Typography variant="h4" color="white" fontWeight="bold">
                {formatCurrency(stats.totalExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%', 
            background: stats.netIncome >= 0 
              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" color="white">
                <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Saldo Líquido</Typography>
              </Box>
              <Typography variant="h4" color="white" fontWeight="bold">
                {formatCurrency(stats.netIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" color="#333">
                <CategoryIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Taxa de Poupança</Typography>
              </Box>
              <Typography variant="h4" color="#333" fontWeight="bold">
                {stats.performanceMetrics.savingsRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição por Categoria
              </Typography>
              {stats.categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {stats.categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height={300}>
                  <Typography color="text.secondary">
                    Nenhuma despesa encontrada no período selecionado
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Maiores Categorias de Despesa
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {stats.categoryStats.length > 0 ? (
                  stats.categoryStats.slice(0, 8).map((cat, index) => (
                    <Box key={cat.category} display="flex" alignItems="center" mb={1}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: COLORS[index % COLORS.length],
                          borderRadius: '50%',
                          mr: 2
                        }}
                      />
                      <Box flexGrow={1}>
                        <Typography variant="body2">{cat.category}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(cat.amount)} ({cat.percentage}%)
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${cat.percentage}%`} 
                        size="small" 
                        sx={{ bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Nenhuma categoria encontrada
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolução Mensal
              </Typography>
              {stats.monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `R$ ${value.toFixed(0)}`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#4CAF50" 
                      strokeWidth={3}
                      name="Receitas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#f44336" 
                      strokeWidth={3}
                      name="Despesas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#2196F3" 
                      strokeWidth={3}
                      name="Saldo Líquido"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height={300}>
                  <Typography color="text.secondary">
                    Nenhum dado encontrado no período selecionado
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedStats; 